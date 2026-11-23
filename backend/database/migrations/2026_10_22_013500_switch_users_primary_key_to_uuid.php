
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $connection = DB::connection();
        $database = $connection->getDatabaseName();

        /*
         * PENGAMAN:
         * Migrasi cutover UUID hanya boleh dijalankan
         * pada database pengujian, bukan database utama.
         */
        if (!in_array($database, ['sistem_izin_uuid_test', 'sistem_izin_uuid_stage_20261022'], true)) {
            throw new RuntimeException(
                'Dibatalkan: cutover UUID hanya boleh dijalankan '
                . 'pada sistem_izin_uuid_test atau sistem_izin_uuid_stage_20261022.'
            );
        }

        /*
         * Pastikan tabel yang diperlukan tersedia.
         */
        $requiredTables = [
            'users',
            'permits',
            'approvals',
            'permit_evidences',
            'user_positions',
            'personal_access_tokens',
            'sessions',
        ];

        foreach ($requiredTables as $table) {
            if (!Schema::hasTable($table)) {
                throw new RuntimeException(
                    "Tabel {$table} tidak ditemukan. Cutover dibatalkan."
                );
            }
        }

        /*
         * Pastikan kolom lama dan kolom bayangan UUID
         * masih tersedia sebelum mengubah struktur.
         */
        $requiredColumns = [
            'users' => [
                'id',
                'uuid',
                'supervisor_id',
                'supervisor_uuid',
            ],
            'permits' => [
                'id',
                'user_id',
                'user_uuid',
                'approval_target_id',
                'approval_target_uuid',
            ],
            'approvals' => [
                'id',
                'approver_id',
                'approver_uuid',
            ],
            'user_positions' => [
                'id',
                'user_id',
                'user_uuid',
            ],
            'personal_access_tokens' => [
                'id',
                'tokenable_type',
                'tokenable_id',
                'tokenable_uuid',
            ],
            'sessions' => [
                'id',
                'user_id',
                'user_uuid',
            ],
        ];

        foreach ($requiredColumns as $table => $columns) {
            foreach ($columns as $column) {
                if (!Schema::hasColumn($table, $column)) {
                    throw new RuntimeException(
                        "Kolom {$table}.{$column} tidak ditemukan. "
                        . 'Cutover dibatalkan tanpa perubahan DDL.'
                    );
                }
            }
        }

        /*
         * Validasi UUID pengguna.
         */
        $userCount = DB::table('users')->count();

        if (
            $userCount === 0
            || DB::table('users')->whereNull('uuid')->exists()
            || DB::table('users')
                ->select('uuid')
                ->groupBy('uuid')
                ->havingRaw('COUNT(*) > 1')
                ->exists()
        ) {
            throw new RuntimeException(
                'UUID users kosong, tidak unik, atau tabel users kosong.'
            );
        }

        /*
         * Pastikan UUID atasan cocok dengan ID numerik lama.
         */
        $supervisorMismatch = DB::table('users as u')
            ->leftJoin('users as s', 's.id', '=', 'u.supervisor_id')
            ->whereNotNull('u.supervisor_id')
            ->where(function ($query) {
                $query->whereNull('s.id')
                    ->orWhereNull('u.supervisor_uuid')
                    ->orWhereColumn(
                        'u.supervisor_uuid',
                        '<>',
                        's.uuid'
                    );
            })
            ->exists();

        if ($supervisorMismatch) {
            throw new RuntimeException(
                'Pemetaan supervisor_uuid tidak cocok '
                . 'dengan supervisor_id.'
            );
        }

        /*
         * Pastikan UUID pemilik izin cocok.
         */
        $permitOwnerMismatch = DB::table('permits as p')
            ->leftJoin('users as u', 'u.id', '=', 'p.user_id')
            ->where(function ($query) {
                $query->whereNull('u.id')
                    ->orWhereNull('p.user_uuid')
                    ->orWhereColumn(
                        'p.user_uuid',
                        '<>',
                        'u.uuid'
                    );
            })
            ->exists();

        if ($permitOwnerMismatch) {
            throw new RuntimeException(
                'Pemetaan user_uuid tidak cocok dengan permits.user_id.'
            );
        }

        /*
         * Pastikan UUID target persetujuan cocok.
         * Target boleh NULL jika pengajuan memang tidak memilikinya.
         */
        $permitTargetMismatch = DB::table('permits as p')
            ->leftJoin(
                'users as u',
                'u.id',
                '=',
                'p.approval_target_id'
            )
            ->where(function ($query) {
                $query->where(function ($inner) {
                    $inner->whereNull('p.approval_target_id')
                        ->whereNotNull('p.approval_target_uuid');
                })->orWhere(function ($inner) {
                    $inner->whereNotNull('p.approval_target_id')
                        ->where(function ($nested) {
                            $nested->whereNull('u.id')
                                ->orWhereNull('p.approval_target_uuid')
                                ->orWhereColumn(
                                    'p.approval_target_uuid',
                                    '<>',
                                    'u.uuid'
                                );
                        });
                });
            })
            ->exists();

        if ($permitTargetMismatch) {
            throw new RuntimeException(
                'Pemetaan approval_target_uuid tidak cocok '
                . 'dengan approval_target_id.'
            );
        }

        /*
         * Pastikan UUID pemberi persetujuan cocok.
         */
        $approvalMismatch = DB::table('approvals as a')
            ->leftJoin(
                'users as u',
                'u.id',
                '=',
                'a.approver_id'
            )
            ->where(function ($query) {
                $query->whereNull('u.id')
                    ->orWhereNull('a.approver_uuid')
                    ->orWhereColumn(
                        'a.approver_uuid',
                        '<>',
                        'u.uuid'
                    );
            })
            ->exists();

        if ($approvalMismatch) {
            throw new RuntimeException(
                'Pemetaan approver_uuid tidak cocok '
                . 'dengan approvals.approver_id.'
            );
        }

        /*
         * Pastikan UUID pemilik posisi cocok.
         */
        $positionMismatch = DB::table('user_positions as p')
            ->leftJoin('users as u', 'u.id', '=', 'p.user_id')
            ->where(function ($query) {
                $query->whereNull('u.id')
                    ->orWhereNull('p.user_uuid')
                    ->orWhereColumn(
                        'p.user_uuid',
                        '<>',
                        'u.uuid'
                    );
            })
            ->exists();

        if ($positionMismatch) {
            throw new RuntimeException(
                'Pemetaan user_positions.user_uuid '
                . 'tidak cocok dengan user_id.'
            );
        }

        /*
         * Pastikan semua token yang akan diubah memang
         * milik App\Models\User.
         */
        if (
            DB::table('personal_access_tokens')
                ->where(
                    'tokenable_type',
                    '<>',
                    'App\\Models\\User'
                )
                ->exists()
        ) {
            throw new RuntimeException(
                'Ada token Sanctum yang bukan milik App\\Models\\User. '
                . 'Audit jenis token sebelum cutover.'
            );
        }

        /*
         * Pastikan UUID token cocok dengan pemiliknya.
         */
        $tokenMismatch = DB::table('personal_access_tokens as t')
            ->leftJoin(
                'users as u',
                'u.id',
                '=',
                't.tokenable_id'
            )
            ->where(function ($query) {
                $query->whereNull('u.id')
                    ->orWhereNull('t.tokenable_uuid')
                    ->orWhereColumn(
                        't.tokenable_uuid',
                        '<>',
                        'u.uuid'
                    );
            })
            ->exists();

        if ($tokenMismatch) {
            throw new RuntimeException(
                'Pemetaan tokenable_uuid tidak cocok '
                . 'dengan tokenable_id.'
            );
        }

        /*
         * Pastikan UUID sesi cocok dengan pemiliknya.
         */
        $sessionMismatch = DB::table('sessions as s')
            ->leftJoin('users as u', 'u.id', '=', 's.user_id')
            ->whereNotNull('s.user_id')
            ->where(function ($query) {
                $query->whereNull('u.id')
                    ->orWhereNull('s.user_uuid')
                    ->orWhereColumn(
                        's.user_uuid',
                        '<>',
                        'u.uuid'
                    );
            })
            ->exists();

        if ($sessionMismatch) {
            throw new RuntimeException(
                'Pemetaan sessions.user_uuid tidak cocok '
                . 'dengan sessions.user_id.'
            );
        }

        /*
         * Periksa foreign key yang akan dilepas.
         * Jika ada yang tidak ditemukan, hentikan migrasi
         * sebelum perubahan struktur dimulai.
         */
        $requiredForeignKeys = [
            'permits' => [
                'permits_user_id_foreign',
                'permits_approval_target_id_foreign',
            ],
            'approvals' => [
                'approvals_approver_id_foreign',
            ],
            'user_positions' => [
                'user_positions_user_id_foreign',
            ],
            'users' => [
                'users_supervisor_id_foreign',
            ],
        ];

        foreach ($requiredForeignKeys as $table => $expectedKeys) {
            $rows = DB::select(
                'SELECT DISTINCT CONSTRAINT_NAME
                 FROM information_schema.KEY_COLUMN_USAGE
                 WHERE CONSTRAINT_SCHEMA = ?
                   AND TABLE_NAME = ?
                   AND REFERENCED_TABLE_NAME IS NOT NULL',
                [$database, $table]
            );

            $foundKeys = array_map(
                fn ($row) => $row->CONSTRAINT_NAME,
                $rows
            );

            foreach ($expectedKeys as $key) {
                if (!in_array($key, $foundKeys, true)) {
                    throw new RuntimeException(
                        "Foreign key {$table}.{$key} tidak ditemukan. "
                        . 'Cutover dibatalkan.'
                    );
                }
            }
        }

        /*
         * Pastikan indeks UUID yang akan dilepas tersedia.
         */
        $uuidIndex = DB::select(
            'SELECT INDEX_NAME
             FROM information_schema.STATISTICS
             WHERE TABLE_SCHEMA = ?
               AND TABLE_NAME = ?
               AND INDEX_NAME = ?
               AND NON_UNIQUE = 0',
            [$database, 'users', 'users_uuid_unique']
        );

        if (count($uuidIndex) === 0) {
            throw new RuntimeException(
                'Indeks users_uuid_unique tidak ditemukan. '
                . 'Cutover dibatalkan.'
            );
        }

        /*
         * Catat jumlah data sebelum perubahan struktur.
         * ID izin dan relasi permit_id tetap numerik.
         */
        $before = [
            'users' => DB::table('users')->count(),
            'permits' => DB::table('permits')->count(),
            'approvals' => DB::table('approvals')->count(),
            'evidences' => DB::table('permit_evidences')->count(),
            'positions' => DB::table('user_positions')->count(),
            'tokens' => DB::table('personal_access_tokens')->count(),
            'sessions' => DB::table('sessions')->count(),
        ];

        /*
         * 1. Lepaskan foreign key yang mengarah ke users.id.
         */
        DB::statement(
            'ALTER TABLE permits '
            . 'DROP FOREIGN KEY permits_user_id_foreign'
        );

        DB::statement(
            'ALTER TABLE permits '
            . 'DROP FOREIGN KEY permits_approval_target_id_foreign'
        );

        DB::statement(
            'ALTER TABLE approvals '
            . 'DROP FOREIGN KEY approvals_approver_id_foreign'
        );

        DB::statement(
            'ALTER TABLE user_positions '
            . 'DROP FOREIGN KEY user_positions_user_id_foreign'
        );

        DB::statement(
            'ALTER TABLE users '
            . 'DROP FOREIGN KEY users_supervisor_id_foreign'
        );

        /*
         * 2. Pertahankan ID pengguna numerik lama sebagai legacy_id.
         */
        DB::statement(
            'ALTER TABLE users '
            . 'MODIFY COLUMN id BIGINT UNSIGNED NOT NULL'
        );

        DB::statement(
            'ALTER TABLE users '
            . 'ADD UNIQUE KEY users_legacy_id_unique (id)'
        );

        DB::statement(
            'ALTER TABLE users DROP PRIMARY KEY'
        );

        DB::statement(
            'ALTER TABLE users '
            . 'CHANGE COLUMN id legacy_id BIGINT UNSIGNED NOT NULL'
        );

        DB::statement(
            'ALTER TABLE users '
            . 'MODIFY COLUMN legacy_id BIGINT UNSIGNED NULL'
        );

        /*
         * 3. Jadikan UUID sebagai primary key users.id.
         */
        DB::statement(
            'ALTER TABLE users DROP INDEX users_uuid_unique'
        );

        DB::statement(
            'ALTER TABLE users '
            . 'CHANGE COLUMN uuid id CHAR(36) '
            . 'CHARACTER SET utf8mb4 '
            . 'COLLATE utf8mb4_unicode_ci NOT NULL'
        );

        DB::statement(
            'ALTER TABLE users DROP COLUMN supervisor_id'
        );

        DB::statement(
            'ALTER TABLE users '
            . 'CHANGE COLUMN supervisor_uuid supervisor_id CHAR(36) '
            . 'CHARACTER SET utf8mb4 '
            . 'COLLATE utf8mb4_unicode_ci NULL'
        );

        DB::statement(
            'ALTER TABLE users ADD PRIMARY KEY (id)'
        );

        DB::statement(
            'ALTER TABLE users '
            . 'ADD KEY users_supervisor_id_uuid_index (supervisor_id)'
        );

        /*
         * 4. Ganti foreign key pemohon dan target pada permits.
         * permits.id tetap numerik.
         */
        DB::statement(
            'ALTER TABLE permits '
            . 'DROP COLUMN user_id, '
            . 'DROP COLUMN approval_target_id'
        );

        DB::statement(
            'ALTER TABLE permits '
            . 'CHANGE COLUMN user_uuid user_id CHAR(36) '
            . 'CHARACTER SET utf8mb4 '
            . 'COLLATE utf8mb4_unicode_ci NOT NULL, '
            . 'CHANGE COLUMN approval_target_uuid approval_target_id CHAR(36) '
            . 'CHARACTER SET utf8mb4 '
            . 'COLLATE utf8mb4_unicode_ci NULL'
        );

        DB::statement(
            'ALTER TABLE permits '
            . 'ADD KEY permits_user_id_uuid_index (user_id), '
            . 'ADD KEY permits_approval_target_id_uuid_index (approval_target_id)'
        );

        DB::statement(
            'ALTER TABLE permits '
            . 'ADD CONSTRAINT permits_user_id_foreign '
            . 'FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE, '
            . 'ADD CONSTRAINT permits_approval_target_id_foreign '
            . 'FOREIGN KEY (approval_target_id) REFERENCES users (id) ON DELETE SET NULL'
        );

        /*
         * 5. Ganti foreign key pemberi persetujuan.
         * approvals.id dan approvals.permit_id tetap numerik.
         */
        DB::statement(
            'ALTER TABLE approvals DROP COLUMN approver_id'
        );

        DB::statement(
            'ALTER TABLE approvals '
            . 'CHANGE COLUMN approver_uuid approver_id CHAR(36) '
            . 'CHARACTER SET utf8mb4 '
            . 'COLLATE utf8mb4_unicode_ci NOT NULL'
        );

        DB::statement(
            'ALTER TABLE approvals '
            . 'ADD KEY approvals_approver_id_uuid_index (approver_id)'
        );

        DB::statement(
            'ALTER TABLE approvals '
            . 'ADD CONSTRAINT approvals_approver_id_foreign '
            . 'FOREIGN KEY (approver_id) REFERENCES users (id) ON DELETE CASCADE'
        );

        /*
         * 6. Ganti foreign key pemilik posisi.
         */
        DB::statement(
            'ALTER TABLE user_positions DROP INDEX user_positions_user_id_is_active_index'
        );

        DB::statement(
            'ALTER TABLE user_positions DROP COLUMN user_id'
        );

        DB::statement(
            'ALTER TABLE user_positions '
            . 'CHANGE COLUMN user_uuid user_id CHAR(36) '
            . 'CHARACTER SET utf8mb4 '
            . 'COLLATE utf8mb4_unicode_ci NOT NULL'
        );

        DB::statement(
            'ALTER TABLE user_positions '
            . 'ADD KEY user_positions_user_id_is_active_index '
            . '(user_id, is_active)'
        );

        DB::statement(
            'ALTER TABLE user_positions '
            . 'ADD CONSTRAINT user_positions_user_id_foreign '
            . 'FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE'
        );

        /*
         * 7. Ganti ID polimorfik token Sanctum ke UUID.
         */
        DB::statement(
            'ALTER TABLE personal_access_tokens DROP INDEX personal_access_tokens_tokenable_type_tokenable_id_index'
        );

        DB::statement(
            'ALTER TABLE personal_access_tokens DROP COLUMN tokenable_id'
        );

        DB::statement(
            'ALTER TABLE personal_access_tokens '
            . 'CHANGE COLUMN tokenable_uuid tokenable_id CHAR(36) '
            . 'CHARACTER SET utf8mb4 '
            . 'COLLATE utf8mb4_unicode_ci NOT NULL'
        );

        DB::statement(
            'ALTER TABLE personal_access_tokens '
            . 'ADD KEY personal_access_tokens_tokenable_type_tokenable_id_index '
            . '(tokenable_type, tokenable_id)'
        );

        /*
         * 8. Ganti ID pengguna dalam sessions ke UUID.
         */
        DB::statement(
            'ALTER TABLE sessions DROP COLUMN user_id'
        );

        DB::statement(
            'ALTER TABLE sessions '
            . 'CHANGE COLUMN user_uuid user_id CHAR(36) '
            . 'CHARACTER SET utf8mb4 '
            . 'COLLATE utf8mb4_unicode_ci NULL'
        );

        DB::statement(
            'ALTER TABLE sessions ADD KEY sessions_user_id_index (user_id)'
        );

        /*
         * 9. Pasang kembali foreign key supervisor terakhir.
         */
        DB::statement(
            'ALTER TABLE users '
            . 'ADD CONSTRAINT users_supervisor_id_foreign '
            . 'FOREIGN KEY (supervisor_id) REFERENCES users (id) ON DELETE SET NULL'
        );

        /*
         * 10. Verifikasi jumlah data setelah cutover.
         */
        $after = [
            'users' => DB::table('users')->count(),
            'permits' => DB::table('permits')->count(),
            'approvals' => DB::table('approvals')->count(),
            'evidences' => DB::table('permit_evidences')->count(),
            'positions' => DB::table('user_positions')->count(),
            'tokens' => DB::table('personal_access_tokens')->count(),
            'sessions' => DB::table('sessions')->count(),
        ];

        if ($before !== $after) {
            throw new RuntimeException(
                'Jumlah data berubah setelah cutover UUID. '
                . 'Pulihkan database uji dari backup SQL; '
                . 'jangan jalankan ulang migrasi.'
            );
        }

        /*
         * 11. Verifikasi primary key UUID dan legacy_id.
         */
        if (
            DB::table('users')->whereNull('id')->exists()
            || DB::table('users')
                ->select('id')
                ->groupBy('id')
                ->havingRaw('COUNT(*) > 1')
                ->exists()
            || DB::table('users')->whereNull('legacy_id')->exists()
        ) {
            throw new RuntimeException(
                'Validasi primary key UUID atau legacy_id gagal. '
                . 'Pulihkan database uji dari backup SQL.'
            );
        }

        /*
         * 12. Verifikasi tidak ada relasi pengguna yatim.
         */
        $orphanChecks = [
            DB::table('permits as p')
                ->leftJoin('users as u', 'u.id', '=', 'p.user_id')
                ->whereNull('u.id')
                ->exists(),

            DB::table('permits as p')
                ->leftJoin(
                    'users as u',
                    'u.id',
                    '=',
                    'p.approval_target_id'
                )
                ->whereNotNull('p.approval_target_id')
                ->whereNull('u.id')
                ->exists(),

            DB::table('approvals as a')
                ->leftJoin('users as u', 'u.id', '=', 'a.approver_id')
                ->whereNull('u.id')
                ->exists(),

            DB::table('user_positions as p')
                ->leftJoin('users as u', 'u.id', '=', 'p.user_id')
                ->whereNull('u.id')
                ->exists(),

            DB::table('users as u')
                ->leftJoin('users as s', 's.id', '=', 'u.supervisor_id')
                ->whereNotNull('u.supervisor_id')
                ->whereNull('s.id')
                ->exists(),
        ];

        if (in_array(true, $orphanChecks, true)) {
            throw new RuntimeException(
                'Ditemukan relasi pengguna tanpa pasangan setelah '
                . 'cutover UUID. Pulihkan database uji dari backup SQL.'
            );
        }
    }

    public function down(): void
    {
        throw new RuntimeException(
            'Cutover UUID tidak dapat di-rollback otomatis dengan aman. '
            . 'Untuk lingkungan uji, pulihkan database dari backup SQL '
            . 'sebelum cutover.'
        );
    }
};
