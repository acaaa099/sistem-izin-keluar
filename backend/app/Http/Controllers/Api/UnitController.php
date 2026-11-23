<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Unit::query()
            ->with('parent:id,name')
            ->withCount(['users', 'children'])
            ->orderBy('name');

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
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

        $units = $query->paginate(15)->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Daftar unit berhasil diambil.',
            'data' => $units,
        ]);
    }
}
