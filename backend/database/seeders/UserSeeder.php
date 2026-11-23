<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'Admin Sistem')->firstOrFail();
        $staffRole = Role::where('name', 'Staff/Pegawai')->firstOrFail();

        $pimpinanUnit = Unit::where('name', 'Pimpinan')->firstOrFail();
        $kepaniteraanUnit = Unit::where('name', 'Kepaniteraan')->firstOrFail();

        // Akun Admin Sistem
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Admin Sistem',
                'email' => 'admin@pengadilan.local',
                'nip' => null,
                'jabatan' => 'Admin Sistem',
                'pangkat_golongan' => null,
                'role_id' => $adminRole->id,
                'unit_id' => $pimpinanUnit->id,
                'password' => '123',
                'is_active' => true,
            ]
        );

        // Akun Staff/Pegawai untuk pengujian permission
        User::updateOrCreate(
            ['username' => 'staff'],
            [
                'name' => 'Staff Testing',
                'email' => 'staff@pengadilan.local',
                'nip' => null,
                'jabatan' => 'Staff/Pegawai',
                'pangkat_golongan' => null,
                'role_id' => $staffRole->id,
                'unit_id' => $kepaniteraanUnit->id,
                'password' => '123',
                'is_active' => true,
            ]
        );
    }
}