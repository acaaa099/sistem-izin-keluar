<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovalTargetController extends Controller
{
    /**
     * Mengambil pejabat dengan jabatan aktif
     * yang dapat dipilih sebagai target persetujuan.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna belum terautentikasi.',
            ], 401);
        }

        // Hakim, Panitera, dan Sekretaris wajib memilih Pimpinan.
        if (!in_array((int) $user->role_id, [3, 4, 5], true)) {
            return response()->json([
                'success' => true,
                'message' => 'Target persetujuan ditentukan otomatis oleh sistem.',
                'data' => [
                    'requires_selection' => false,
                    'approval_targets' => [],
                ],
            ]);
        }

        $targets = User::query()
            ->where('role_id', 2)
            ->where('is_active', true)
            ->whereHas('role', function ($query) {
                $query->where('is_active', true);
            })
            ->whereHas('activePositions', function ($query) {
                $query->whereIn('position_name', [
                    'Ketua',
                    'Wakil Ketua',
                ]);
            })
            ->with(['activePositions' => function ($query) {
                $query->whereIn('position_name', [
                    'Ketua',
                    'Wakil Ketua',
                ]);
            }])
            ->whereHas('role.permissions', function ($query) {
                $query->where('name', 'approve_permit')
                    ->where('permissions.is_active', true);
            })
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(function ($target) {
                $position = $target->activePositions->first();

                return [
                    'id' => $target->id,
                    'name' => $target->name,
                    'jabatan' => $position?->position_name,
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Daftar target persetujuan berhasil diambil.',
            'data' => [
                'requires_selection' => true,
                'approval_targets' => $targets,
            ],
        ]);
    }
}
