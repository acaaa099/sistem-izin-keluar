<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArchiveController extends Controller
{
    /**
     * Menampilkan daftar arsip dokumen seluruh pengajuan izin.
     *
     * Dokumen:
     * 1. Surat izin PDF.
     * 2. Surat izin bertanda tangan.
     *
     * Akses: pengguna dengan permission view_all_permits.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Autentikasi diperlukan.',
            ], 401);
        }

        $user->loadMissing('role.permissions');

        $role = $user->role;

        $canViewAll = $role
            && $role->is_active
            && $role->permissions->contains(
                fn ($permission) =>
                    $permission->name === 'view_all_permits'
                    && (bool) $permission->is_active
            );

        if (!$canViewAll) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk melihat arsip seluruh dokumen.',
            ], 403);
        }

        $permits = Permit::query()
            ->with([
                'user.role',
                'user.unit',
                'evidences' => function ($query) {
                    $query->where(
                        'type',
                        'SIGNED_LETTER_PHOTO'
                    )
                    ->orderByDesc('captured_at')
                    ->orderByDesc('id');
                },
            ])
            ->where(function ($query) {
                $query->where(function ($pdfQuery) {
                    $pdfQuery
                        ->whereNotNull('surat_pdf_path')
                        ->where('surat_pdf_path', '<>', '');
                })
                ->orWhereHas('evidences', function ($evidenceQuery) {
                    $evidenceQuery->where(
                        'type',
                        'SIGNED_LETTER_PHOTO'
                    );
                });
            })
            ->orderByDesc('tanggal_izin')
            ->orderByDesc('id')
            ->get();

        $documents = [];

        foreach ($permits as $permit) {
            $applicant = [
                'id' => $permit->user?->id,
                'name' => $permit->user?->name ?? '-',
                'nip' => $permit->user?->nip,
                'role' => $permit->user?->role?->name,
                'unit' => $permit->user?->unit?->name,
            ];

            /*
             * SURAT IZIN PDF
             */
            if (!empty($permit->surat_pdf_path)) {
                $path = $permit->surat_pdf_path;

                $validPath =
                    !str_contains($path, '..')
                    && !str_starts_with($path, '/')
                    && str_starts_with($path, 'surat-izin/');

                $available = $validPath && (
                    Storage::disk('local')->exists($path)
                    || Storage::disk('public')->exists($path)
                );

                $documents[] = [
                    'id' => 'pdf-' . $permit->id,
                    'document_type' => 'SURAT_IZIN_PDF',
                    'document_name' => 'Surat Izin (PDF)',
                    'permit_id' => $permit->id,
                    'applicant' => $applicant,
                    'jenis_izin' => $permit->jenis_izin,
                    'tanggal_izin' => $permit->tanggal_izin?->format('Y-m-d'),
                    'status' => $permit->status,
                    'submitted_at' => $permit->submitted_at?->toISOString(),
                    'uploaded_at' => null,
                    'is_available' => $available,
                    'file_url' => $available
                        ? route('permits.pdf.download', [
                            'permit' => $permit->id,
                        ])
                        : null,
                ];
            }

            /*
             * SURAT IZIN BERTANDA TANGAN
             */
            foreach ($permit->evidences as $evidence) {
                $path = $evidence->file_path;

                $expectedPrefix =
                    'permit-evidences/' . $permit->id . '/';

                $validPath =
                    !str_contains($path, '..')
                    && !str_starts_with($path, '/')
                    && str_starts_with($path, $expectedPrefix);

                $available = $validPath && (
                    Storage::disk('local')->exists($path)
                    || Storage::disk('public')->exists($path)
                );

                $documents[] = [
                    'id' => 'signed-' . $evidence->id,
                    'document_type' => 'SIGNED_LETTER_PHOTO',
                    'document_name' => 'Surat Izin Bertanda Tangan',
                    'permit_id' => $permit->id,
                    'evidence_id' => $evidence->id,
                    'applicant' => $applicant,
                    'jenis_izin' => $permit->jenis_izin,
                    'tanggal_izin' => $permit->tanggal_izin?->format('Y-m-d'),
                    'status' => $permit->status,
                    'submitted_at' => $permit->submitted_at?->toISOString(),
                    'uploaded_at' => (
                        $evidence->captured_at
                        ?? $evidence->created_at
                    )?->toISOString(),
                    'is_available' => $available,
                    'file_url' => $available
                        ? route('permits.evidences.file', [
                            'permit' => $permit->id,
                            'evidence' => $evidence->id,
                        ])
                        : null,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Arsip dokumen berhasil diambil.',
            'data' => [
                'documents' => $documents,
                'total' => count($documents),
            ],
        ]);
    }
}
