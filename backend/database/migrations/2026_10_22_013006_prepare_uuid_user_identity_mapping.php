
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Migration ini hanya boleh dijalankan pada database uji.
        if (!in_array(DB::connection()->getDatabaseName(), ['sistem_izin_uuid_test', 'sistem_izin_uuid_stage_20261022'], true)) {
            throw new RuntimeException(
                'Dibatalkan: migrasi persiapan hanya boleh dijalankan pada database uji atau staging yang diizinkan.'
            );
        }

        // Tahap ini hanya menambahkan kolom bayangan.
        // Primary Key dan foreign key numerik lama belum diubah.
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('uuid')->nullable();
            $table->uuid('supervisor_uuid')->nullable();
        });

        Schema::table('permits', function (Blueprint $table) {
            $table->uuid('user_uuid')->nullable();
            $table->uuid('approval_target_uuid')->nullable();
        });

        Schema::table('approvals', function (Blueprint $table) {
            $table->uuid('approver_uuid')->nullable();
        });

        Schema::table('user_positions', function (Blueprint $table) {
            $table->uuid('user_uuid')->nullable();
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->uuid('tokenable_uuid')->nullable();
        });

        Schema::table('sessions', function (Blueprint $table) {
            $table->uuid('user_uuid')->nullable();
        });

        // Buat satu UUID stabil untuk setiap akun lama.
        DB::table('users')
            ->select('id')
            ->orderBy('id')
            ->chunk(100, function ($users) {
                foreach ($users as $user) {
                    DB::table('users')
                        ->where('id', $user->id)
                        ->update(['uuid' => (string) Str::uuid()]);
                }
            });

        // UUID harus tersedia dan unik sebelum relasi dipetakan.
        $users = DB::table('users')->get(['id', 'uuid']);

        if ($users->count() === 0 ||
            $users->contains(fn ($user) => empty($user->uuid)) ||
            $users->pluck('uuid')->unique()->count() !== $users->count()) {
            throw new RuntimeException(
                'Pemetaan UUID pengguna kosong atau tidak unik.'
            );
        }

        $uuidById = $users->pluck('uuid', 'id');

        // Petakan atasan langsung.
        foreach (DB::table('users')->get(['id', 'supervisor_id']) as $user) {
            if ($user->supervisor_id !== null) {
                if (!isset($uuidById[$user->supervisor_id])) {
                    throw new RuntimeException(
                        "Supervisor tidak ditemukan untuk users.id={$user->id}."
                    );
                }

                DB::table('users')->where('id', $user->id)->update([
                    'supervisor_uuid' => $uuidById[$user->supervisor_id],
                ]);
            }
        }

        // Petakan pemohon dan target persetujuan.
        foreach (DB::table('permits')->get([
            'id', 'user_id', 'approval_target_id',
        ]) as $permit) {
            if (!isset($uuidById[$permit->user_id])) {
                throw new RuntimeException(
                    "Pemohon tidak ditemukan untuk permits.id={$permit->id}."
                );
            }

            $targetUuid = null;

            if ($permit->approval_target_id !== null) {
                if (!isset($uuidById[$permit->approval_target_id])) {
                    throw new RuntimeException(
                        "Target persetujuan tidak ditemukan untuk permits.id={$permit->id}."
                    );
                }

                $targetUuid = $uuidById[$permit->approval_target_id];
            }

            DB::table('permits')->where('id', $permit->id)->update([
                'user_uuid' => $uuidById[$permit->user_id],
                'approval_target_uuid' => $targetUuid,
            ]);
        }

        // Petakan pemberi persetujuan.
        foreach (DB::table('approvals')->get([
            'id', 'approver_id',
        ]) as $approval) {
            if (!isset($uuidById[$approval->approver_id])) {
                throw new RuntimeException(
                    "Pemberi persetujuan tidak ditemukan untuk approvals.id={$approval->id}."
                );
            }

            DB::table('approvals')
                ->where('id', $approval->id)
                ->update([
                    'approver_uuid' => $uuidById[$approval->approver_id],
                ]);
        }

        // Petakan pemilik posisi.
        foreach (DB::table('user_positions')->get([
            'id', 'user_id',
        ]) as $position) {
            if (!isset($uuidById[$position->user_id])) {
                throw new RuntimeException(
                    "Pemilik posisi tidak ditemukan untuk user_positions.id={$position->id}."
                );
            }

            DB::table('user_positions')
                ->where('id', $position->id)
                ->update([
                    'user_uuid' => $uuidById[$position->user_id],
                ]);
        }

        // Petakan token hanya untuk model User.
        foreach (DB::table('personal_access_tokens')
            ->where('tokenable_type', 'App\\Models\\User')
            ->get(['id', 'tokenable_id']) as $token) {
            if (!isset($uuidById[$token->tokenable_id])) {
                throw new RuntimeException(
                    "Pemilik token tidak ditemukan untuk token ID={$token->id}."
                );
            }

            DB::table('personal_access_tokens')
                ->where('id', $token->id)
                ->update([
                    'tokenable_uuid' => $uuidById[$token->tokenable_id],
                ]);
        }

        // Petakan sesi yang memiliki user_id.
        foreach (DB::table('sessions')
            ->whereNotNull('user_id')
            ->get(['id', 'user_id']) as $session) {
            if (!isset($uuidById[$session->user_id])) {
                throw new RuntimeException(
                    'Pemilik sesi tidak ditemukan.'
                );
            }

            DB::table('sessions')
                ->where('id', $session->id)
                ->update([
                    'user_uuid' => $uuidById[$session->user_id],
                ]);
        }

        // Validasi pemetaan sebelum migration dianggap berhasil.
        $checks = [
            ['permits', 'user_uuid'],
            ['approvals', 'approver_uuid'],
            ['user_positions', 'user_uuid'],
        ];

        foreach ($checks as [$table, $column]) {
            if (DB::table($table)->whereNull($column)->exists()) {
                throw new RuntimeException(
                    "Pemetaan UUID belum lengkap pada {$table}.{$column}."
                );
            }
        }

        if (DB::table('permits')
            ->whereNotNull('approval_target_id')
            ->whereNull('approval_target_uuid')
            ->exists()) {
            throw new RuntimeException(
                'Pemetaan target persetujuan belum lengkap.'
            );
        }

        if (DB::table('personal_access_tokens')
            ->where('tokenable_type', 'App\\Models\\User')
            ->whereNull('tokenable_uuid')
            ->exists()) {
            throw new RuntimeException(
                'Pemetaan UUID token Sanctum belum lengkap.'
            );
        }

        // Pastikan UUID pengguna memiliki indeks unik.
        Schema::table('users', function (Blueprint $table) {
            $table->unique('uuid', 'users_uuid_unique');
        });
    }

    public function down(): void
    {
        if (!in_array(DB::connection()->getDatabaseName(), ['sistem_izin_uuid_test', 'sistem_izin_uuid_stage_20261022'], true)) {
            throw new RuntimeException(
                'Dibatalkan: rollback hanya boleh dilakukan pada database uji atau staging yang diizinkan.'
            );
        }

        // Kolom UUID bayangan dapat dihapus karena tahap ini
        // belum mengganti Primary Key atau foreign key lama.
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropColumn('user_uuid');
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropColumn('tokenable_uuid');
        });

        Schema::table('user_positions', function (Blueprint $table) {
            $table->dropColumn('user_uuid');
        });

        Schema::table('approvals', function (Blueprint $table) {
            $table->dropColumn('approver_uuid');
        });

        Schema::table('permits', function (Blueprint $table) {
            $table->dropColumn(['user_uuid', 'approval_target_uuid']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_uuid_unique');
            $table->dropColumn(['uuid', 'supervisor_uuid']);
        });
    }
};
