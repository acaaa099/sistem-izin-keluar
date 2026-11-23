<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Permission::query()
            ->withCount('roles')
            ->orderBy('name');

        // Pencarian berdasarkan nama atau deskripsi.
        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan status aktif.
        if ($request->filled('status')) {
            $status = $request->input('status');

            if (in_array($status, ['active', 'inactive'], true)) {
                $query->where(
                    'is_active',
                    $status === 'active'
                );
            }
        }

        // Batasi hasil menjadi 15 data per halaman.
        $permissions = $query->paginate(15)->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Daftar permission berhasil diambil.',
            'data' => $permissions,
        ]);
    }
}
