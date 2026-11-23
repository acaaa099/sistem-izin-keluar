<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = Permission::all()->keyBy('name');

        $rolePermissions = [
            'Admin Sistem' => [
                'view_dashboard',
                'view_monitoring',
                'view_all_permits',
                'manage_users',
                'manage_roles',
                'manage_permissions',
                'manage_units',
                'manage_approval_mappings',
                'view_archive',
            ],

            'Ketua/Wakil Ketua' => [
                'view_dashboard',
                'approve_permit',
                'revise_permit',
                'reject_permit',
                'view_subordinate_permits',
                'view_monitoring',
                'view_archive',
            ],

            'Hakim' => [
                'view_dashboard',
                'approve_permit',
                'revise_permit',
                'reject_permit',
                'view_subordinate_permits',
                'view_monitoring',
                'view_archive',
            ],

            'Panitera' => [
                'view_dashboard',
                'approve_permit',
                'revise_permit',
                'reject_permit',
                'view_subordinate_permits',
                'view_monitoring',
                'view_archive',
            ],

            'Sekretaris' => [
                'view_dashboard',
                'approve_permit',
                'revise_permit',
                'reject_permit',
                'view_subordinate_permits',
                'view_monitoring',
                'view_archive',
            ],

            'Panmud/Kasub' => [
                'view_dashboard',
                'approve_permit',
                'revise_permit',
                'reject_permit',
                'view_subordinate_permits',
                'view_monitoring',
                'view_archive',
            ],

            'Staff/Pegawai' => [
                'view_dashboard',
                'create_permit',
                'view_own_permits',
                'edit_own_permit',
                'upload_evidence',
                'view_archive',
            ],
        ];

        foreach ($rolePermissions as $roleName => $permissionNames) {
            $role = Role::where('name', $roleName)->first();

            if (!$role) {
                continue;
            }

            $permissionIds = collect($permissionNames)
                ->filter(fn ($name) => isset($permissions[$name]))
                ->map(fn ($name) => $permissions[$name]->id)
                ->values()
                ->all();

            $role->permissions()->sync($permissionIds);
        }
    }
}