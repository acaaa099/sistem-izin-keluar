<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Role::query()
            ->withCount(['users', 'permissions'])
            ->orderBy('name');

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $status = $request->input('status');

            if (in_array($status, ['active', 'inactive'], true)) {
                $query->where(
                    'is_active',
                    $status === 'active'
                );
            }
        }

        $roles = $query->paginate(15)->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Daftar role berhasil diambil.',
            'data' => $roles,
        ]);
    }
}
