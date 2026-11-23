<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            [
                'name' => 'view_dashboard',
                'description' => 'Melihat dashboard sistem.',
            ],
            [
                'name' => 'create_permit',
                'description' => 'Membuat dan mengajukan izin.',
            ],
            [
                'name' => 'view_own_permits',
                'description' => 'Melihat data izin milik sendiri.',
            ],
            [
                'name' => 'view_subordinate_permits',
                'description' => 'Melihat pengajuan izin bawahan langsung sesuai kewenangan.',
            ],
            [
                'name' => 'edit_own_permit',
                'description' => 'Mengubah pengajuan izin milik sendiri saat direvisi.',
            ],
            [
                'name' => 'upload_evidence',
                'description' => 'Mengunggah atau mengambil bukti izin.',
            ],
            [
                'name' => 'approve_permit',
                'description' => 'Menyetujui pengajuan izin sesuai kewenangan.',
            ],
            [
                'name' => 'revise_permit',
                'description' => 'Mengembalikan pengajuan izin untuk diperbaiki.',
            ],
            [
                'name' => 'reject_permit',
                'description' => 'Menolak pengajuan izin sesuai kewenangan.',
            ],
            [
                'name' => 'view_monitoring',
                'description' => 'Melihat monitoring status izin dan keberadaan pegawai sesuai kewenangan.',
            ],
            [
                'name' => 'view_all_permits',
                'description' => 'Melihat seluruh data izin sesuai kewenangan.',
            ],
            [
                'name' => 'manage_users',
                'description' => 'Mengelola data pengguna sistem.',
            ],
            [
                'name' => 'manage_roles',
                'description' => 'Mengelola role pengguna.',
            ],
            [
                'name' => 'manage_permissions',
                'description' => 'Mengelola permission sistem.',
            ],
            [
                'name' => 'manage_units',
                'description' => 'Mengelola data unit organisasi.',
            ],
            [
                'name' => 'manage_approval_mappings',
                'description' => 'Mengelola aturan alur persetujuan izin.',
            ],
            [
                'name' => 'view_archive',
                'description' => 'Melihat arsip izin yang telah selesai.',
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name']],
                [
                    'description' => $permission['description'],
                    'is_active' => true,
                ]
            );
        }
    }
}