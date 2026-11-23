<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApprovalMapping;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovalMappingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ApprovalMapping::query()
            ->with([
                'requesterRole:id,name',
                'requesterUnit:id,name',
                'approverRole:id,name',
                'approverUnit:id,name',
            ])
            ->orderBy('sequence')
            ->orderBy('id');

        if ($request->filled('status')) {
            $status = $request->input('status');

            if (in_array($status, ['active', 'inactive'], true)) {
                $query->where(
                    'is_active',
                    $status === 'active'
                );
            }
        }

        $mappings = $query->paginate(15)->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pemetaan persetujuan berhasil diambil.',
            'data' => $mappings,
        ]);
    }
}
