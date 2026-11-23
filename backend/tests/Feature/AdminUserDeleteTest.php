<?php

namespace Tests\Feature;

use App\Models\Approval;
use App\Models\Permission;
use App\Models\Permit;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminUserDeleteTest extends TestCase
{
    private bool $testTransactionStarted = false;

    protected function setUp(): void
    {
        parent::setUp();

        if (config('database.default') !== 'mysql') {
            $this->fail('Tes dibatalkan: koneksi default bukan MySQL.');
        }

        $connection = DB::connection('mysql');

        if ($connection->getDatabaseName() !== 'sistem_izin_uuid_test') {
            $this->fail(
                'Tes dibatalkan: database harus sistem_izin_uuid_test. '
                . 'Database aktual: ' . $connection->getDatabaseName()
            );
        }

        $connection->beginTransaction();
        $this->testTransactionStarted = true;
    }

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
                'description' => 'Permission untuk tes penghapusan pengguna',
                'is_active' => true,
            ]
        );

        if (!$permission->is_active) {
            $permission->is_active = true;
            $permission->save();
        }

        return $permission;
    }

    private function roleWithPermission(string $permissionName): Role
    {
        $permission = $this->permission($permissionName);

        do {
            $role = Role::create([
                'name' => 'test-delete-' . Str::uuid(),
                'description' => 'Role sementara untuk tes penghapusan',
                'is_active' => true,
            ]);
        } while (in_array((int) $role->id, [3, 4, 5], true));

        $role->permissions()->attach($permission->id);

        return $role;
    }

    private function createUser(Role $role): User
    {
        $uuid = (string) Str::uuid();

        return User::create([
            'name' => 'Pengguna Tes ' . $uuid,
            'username' => 'test_' . str_replace('-', '', $uuid),
            'email' => $uuid . '@example.test',
            'password' => 'password-for-testing',
            'role_id' => $role->id,
            'is_active' => true,
        ]);
    }

    private function adminUser(): User
    {
        return $this->createUser(
            $this->roleWithPermission('manage_users')
        );
    }

    public function test_user_with_approval_history_cannot_be_deleted(): void
    {
        $admin = $this->adminUser();

        $target = $this->createUser(
            $this->roleWithPermission('test_delete_target')
        );

        $owner = $this->createUser(
            $this->roleWithPermission('test_delete_owner')
        );

        $permit = Permit::create([
            'user_id' => $owner->id,
            'jenis_izin' => 'keperluan-pribadi',
            'tanggal_izin' => now()->addDays(2)->toDateString(),
            'jam_keluar' => '09:00:00',
            'estimasi_kembali' => '10:00:00',
            'alasan' => 'Data khusus tes otomatis.',
            'status' => 'DIAJUKAN',
            'submitted_at' => now(),
        ]);

        Approval::create([
            'permit_id' => $permit->id,
            'approver_id' => $target->id,
            'action' => 'DISETUJUI',
            'catatan' => 'Data khusus tes otomatis.',
            'acted_at' => now(),
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/admin/users/' . $target->id);

        $response->assertStatus(409)
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('users', [
            'id' => $target->id,
        ]);
    }

    public function test_admin_cannot_delete_own_account(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/admin/users/' . $admin->id);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
        ]);
    }

    public function test_user_without_important_relations_can_be_deleted(): void
    {
        $admin = $this->adminUser();

        $target = $this->createUser(
            $this->roleWithPermission('test_delete_target')
        );

        $targetId = $target->id;

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/admin/users/' . $targetId);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Pengguna berhasil dihapus.');

        $this->assertDatabaseMissing('users', [
            'id' => $targetId,
        ]);
    }
}
