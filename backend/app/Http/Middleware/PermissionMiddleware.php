<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    public function handle(
        Request $request,
        Closure $next,
        string ...$permissions
    ): Response {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $user->loadMissing('role.permissions');

        $role = $user->role;

        if (!$role || !$role->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Role pengguna tidak aktif atau tidak tersedia.',
            ], 403);
        }

        $hasPermission = $role->permissions->contains(
            fn ($permission) =>
                in_array($permission->name, $permissions, true)
                && (bool) $permission->is_active
        );

        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki permission aktif untuk melakukan tindakan ini.',
            ], 403);
        }

        return $next($request);
    }
}