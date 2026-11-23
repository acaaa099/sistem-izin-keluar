<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Permit;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class PermitUuidRevisionTest extends TestCase
{
    private bool $testTransactionStarted = false;

    /**
     * Pastikan tes hanya memakai database uji UUID.
     * Transaksi dimulai setelah database berhasil diverifikasi.
     */
    protected function setUp(): void
    {
        parent::setUp();

        if (config('database.default') !== 'mysql') {
            $this->fail(
                'Tes dibatalkan: koneksi default bukan MySQL.'
            );
        }

        $connection = DB::connection('mysql');

        if (
            $connection->getDatabaseName()
            !== 'sistem_izin_uuid_test'
        ) {
            $this->fail(
                'Tes dibatalkan: database harus '
                . 'sistem_izin_uuid_test. Database aktual: '
                . $connection->getDatabaseName()
            );
        }

        $connection->beginTransaction();
        $this->testTransactionStarted = true;
    }

    /**
     * Batalkan semua perubahan database dari tes ini.
     */
    protected function tearDown(): void
    {
        try {
            if ($this->testTransactionStarted) {
                $connection = DB::connection('mysql');

                if ($connection->transactionLevel() > 0) {
                    $connection->rollBack();
                }

                $this->testTransactionStarted = false;
            }
        } finally {
            parent::tearDown();
        }
    }

    private function permission(string $name): Permission
    {
        $permission = Permission::firstOrCreate(
            ['name' => $name],
            [
                'description' => 'Permission sementara untuk tes UUID',
                'is_active' => true,
            ]
        );

        if (!$permission->is_active) {
            $permission->is_active = true;
            $permission->save();
        }

        return $permission;
    }

    /**
     * Buat role pengujian beserta satu permission.
     * Role ID 3, 4, dan 5 dihindari karena mempunyai
     * alur pemilihan target khusus di PermitController.
     */
    private function roleWithPermission(string $permissionName): Role
    {
        $permission = $this->permission($permissionName);

        do {
            $role = Role::create([
                'name' => 'test-uuid-' . Str::uuid(),
                'description' => 'Role sementara untuk tes UUID',
                'is_active' => true,
            ]);
        } while (in_array((int) $role->id, [3, 4, 5], true));

        $role->permissions()->attach($permission->id);

        return $role;
    }

    private function createUser(
        Role $role,
        ?User $supervisor = null
    ): User {
        $unique = (string) Str::uuid();

        return User::create([
            'name' => 'Pengguna Tes UUID',
            'username' => 'test_' . $unique,
            'email' => 'test_' . $unique . '@example.test',
            'password' => 'password-for-testing',
            'role_id' => $role->id,
            'supervisor_id' => $supervisor?->id,
            'is_active' => true,
        ]);
    }

    /**
     * Membuat pemohon dan atasan dengan permission yang dibutuhkan.
     */
    private function createRequesterAndApprover(): array
    {
        $approverRole = $this->roleWithPermission(
            'approve_permit'
        );

        $approver = $this->createUser($approverRole);

        $requesterRole = $this->roleWithPermission(
            'edit_own_permit'
        );

        $requester = $this->createUser(
            $requesterRole,
            $approver
        );

        return [$requester, $approver];
    }

    private function createPermit(
        User $owner,
        string $status = 'REVISI'
    ): Permit {
        return Permit::create([
            'user_id' => $owner->id,
            'approval_target_id' => $owner->supervisor_id,
            'jenis_izin' => 'keperluan-pribadi',
            'tanggal_izin' => now()->addDays(2)->toDateString(),
            'jam_keluar' => '09:00:00',
            'estimasi_kembali' => '10:00:00',
            'alasan' => 'Pengujian otomatis pengajuan izin UUID.',
            'status' => $status,
            'submitted_at' => now()->subDays(3),
            'approved_at' => now()->subDays(2),
            'completed_at' => now()->subDay(),
        ]);
    }

    private function validPayload(): array
    {
        return [
            'jenis_izin' => 'keperluan-pribadi',
            'tanggal_izin' => now()->addDays(2)->toDateString(),
            'jam_keluar' => '09:00',
            'estimasi_kembali' => '10:00',
            'alasan' => 'Pengajuan ulang setelah memperbaiki revisi.',
        ];
    }

    /**
     * Tes 1:
     * Pemilik dapat mengirim ulang izin REVISI dengan UUID.
     */
    public function test_owner_can_resubmit_revision_with_uuid_ids(): void
    {
        [$owner, $approver] = $this->createRequesterAndApprover();

        $permit = $this->createPermit($owner, 'REVISI');
        $oldSubmittedAt = $permit->submitted_at->copy();

        $response = $this->actingAs($owner, 'sanctum')
            ->putJson(
                '/api/permits/' . $permit->id,
                $this->validPayload()
            );

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.permit.status', 'DIAJUKAN')
            ->assertJsonPath(
                'data.permit.approval_target_id',
                $approver->id
            );

        $permit->refresh();

        $this->assertSame(
            (string) $owner->id,
            (string) $permit->user_id
        );

        $this->assertSame(
            (string) $approver->id,
            (string) $permit->approval_target_id
        );

        $this->assertSame('DIAJUKAN', $permit->status);
        $this->assertNull($permit->approved_at);
        $this->assertNull($permit->completed_at);

        $this->assertTrue(
            $permit->submitted_at->greaterThan($oldSubmittedAt),
            'Waktu pengajuan ulang seharusnya diperbarui.'
        );
    }

    /**
     * Tes 2:
     * Pengguna lain tidak boleh mengubah izin milik orang lain.
     */
    public function test_different_user_cannot_resubmit_another_users_permit(): void
    {
        [$owner] = $this->createRequesterAndApprover();
        $permit = $this->createPermit($owner, 'REVISI');

        [$otherUser] = $this->createRequesterAndApprover();

        $response = $this->actingAs($otherUser, 'sanctum')
            ->putJson(
                '/api/permits/' . $permit->id,
                $this->validPayload()
            );

        $response->assertStatus(403);

        $this->assertSame(
            'REVISI',
            $permit->fresh()->status
        );
    }

    /**
     * Tes 3:
     * Izin yang bukan berstatus REVISI tidak dapat diedit
     * melalui endpoint pengajuan ulang.
     */
    public function test_permit_not_in_revision_status_cannot_be_updated(): void
    {
        [$owner] = $this->createRequesterAndApprover();
        $permit = $this->createPermit($owner, 'DIAJUKAN');

        $response = $this->actingAs($owner, 'sanctum')
            ->putJson(
                '/api/permits/' . $permit->id,
                $this->validPayload()
            );

        $response->assertStatus(422);

        $this->assertSame(
            'DIAJUKAN',
            $permit->fresh()->status
        );
    }
}