<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PermitCompletionController extends Controller
{
    public function complete(Request $request, Permit $permit): JsonResponse
    {
        $user = $request->user();

        // Hanya pemilik izin yang boleh menyelesaikan izinnya
        if ($permit->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk menyelesaikan izin ini.'
            ], 403);
        }

        // Status harus MENUNGGU PENYELESAIAN
        if ($permit->status !== 'MENUNGGU PENYELESAIAN') {
            return response()->json([
                'success' => false,
                'message' => 'Izin belum berada pada tahap yang dapat diselesaikan.'
            ], 422);
        }

        // Ambil semua evidence
        $evidences = $permit->evidences()
            ->get()
            ->groupBy('type');

        // Validasi ACTIVITY_PHOTO
        if (!isset($evidences['ACTIVITY_PHOTO']) || $evidences['ACTIVITY_PHOTO']->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Foto aktivitas belum diunggah.'
            ], 422);
        }

        // Validasi RETURN_PHOTO
        if (!isset($evidences['RETURN_PHOTO']) || $evidences['RETURN_PHOTO']->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Foto kembali belum diunggah.'
            ], 422);
        }

        // Validasi SIGNED_LETTER_PHOTO
        if (!isset($evidences['SIGNED_LETTER_PHOTO']) || $evidences['SIGNED_LETTER_PHOTO']->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Foto surat bertanda tangan belum diunggah.'
            ], 422);
        }

        // Validasi jam kembali
        if (!$permit->jam_kembali) {
            return response()->json([
                'success' => false,
                'message' => 'Jam kembali belum tercatat.'
            ], 422);
        }

        DB::transaction(function () use ($permit) {
            $permit->update([
                'status' => 'SELESAI',
                'completed_at' => now(),
            ]);
        });

        $permit->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Izin berhasil diselesaikan.',
            'data' => [
                'permit' => $permit,
            ],
        ], 200);
    }
}