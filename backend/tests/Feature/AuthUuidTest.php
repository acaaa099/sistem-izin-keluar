<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuthUuidTest extends TestCase
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

    private function createLoginUser(): array
    {
        $unique = (string) Str::uuid();

        $role = Role::create([
            'name' => 'auth-uuid-' . $unique,
            'description' => 'Role sementara untuk tes autentikasi UUID',
            'is_active' => true,
        ]);

        $password = 'Password-test-UUID-123!';

        $user = User::create([
            'name' => 'Pengguna Tes Autentikasi UUID',
            'username' => 'auth_' . $unique,
            'email' => 'auth_' . $unique . '@example.test',
            'password' => Hash::make($password),
            'role_id' => $role->id,
            'supervisor_id' => null,
            'is_active' => true,
        ]);

        return [$user, $password];
    }

    public function test_login_creates_uuid_token_and_me_returns_same_user(): void
    {
        [$user, $password] = $this->createLoginUser();

        $login = $this->postJson('/api/login', [
            'username' => $user->username,
            'password' => $password,
        ]);

        $login->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.id', (string) $user->id);

        $token = $login->json('data.token');

        $this->assertIsString($token);
        $this->assertNotSame('', $token);

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_type' => User::class,
            'tokenable_id' => (string) $user->id,
        ]);

        $me = $this->withToken($token)->getJson('/api/me');

        $me->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.id', (string) $user->id)
            ->assertJsonPath('data.user.username', $user->username);
    }

    public function test_login_rejects_incorrect_password(): void
    {
        [$user] = $this->createLoginUser();

        $response = $this->postJson('/api/login', [
            'username' => $user->username,
            'password' => 'Password-yang-salah-999!',
        ]);

        $response->assertUnauthorized()
            ->assertJsonPath('success', false);
    }
}