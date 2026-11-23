<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin Sistem',
                'description' => 'Mengelola sistem, pengguna, role, permission, dan konfigurasi.',
            ],
            [
                'name' => 'Ketua/Wakil Ketua',
                'description' => 'Melakukan persetujuan dan monitoring izin sesuai kewenangan.',
            ],
            [
                'name' => 'Hakim',
                'description' => 'Melakukan persetujuan dan monitoring sesuai kewenangan hakim.',
            ],
            [
                'name' => 'Panitera',
                'description' => 'Melakukan persetujuan dan monitoring pada lingkup kepaniteraan.',
            ],
            [
                'name' => 'Sekretaris',
                'description' => 'Melakukan persetujuan dan monitoring pada lingkup kesekretariatan.',
            ],
            [
                'name' => 'Panmud/Kasub',
                'description' => 'Melakukan persetujuan dan monitoring pada unit bawahannya.',
            ],
            [
                'name' => 'Staff/Pegawai',
                'description' => 'Mengajukan izin dan mengelola proses izin miliknya sendiri.',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                [
                    'description' => $role['description'],
                    'is_active' => true,
                ]
            );
        }
    }
}