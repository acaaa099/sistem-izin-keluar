<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permit;
use App\Models\Role;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class PdfController extends Controller
{
    /**
     * Memuat Role dan permission langsung dari database.
     * Tidak menggunakan relasi role yang mungkin sudah tercache.
     */
    private function getFreshRole($user): ?Role
    {
        if (!$user || !$user->role_id) {
            return null;
        }

        return Role::with('permissions')
            ->find($user->role_id);
    }

    /**
     * Generate surat izin dalam bentuk PDF.
     *
     * Akses:
     * - Pemilik izin dengan role aktif.
     * - Pengguna dengan permission approve_permit aktif.
     */
    public function generate(
        Request $request,
        Permit $permit
    ): JsonResponse {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $role = $this->getFreshRole($user);

        if (!$role || !$role->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Role pengguna tidak aktif atau tidak tersedia.',
            ], 403);
        }

        $hasApprovePermission = $role->permissions->contains(
            fn ($permission) =>
                $permission->name === 'approve_permit'
                && (bool) $permission->is_active
        );

        $isPermitOwner =
            (string) $permit->user_id === (string) $user->id;

        if (!$isPermitOwner && !$hasApprovePermission) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk membuat surat izin ini.',
            ], 403);
        }

        if ($permit->status !== 'DISETUJUI') {
            return response()->json([
                'success' => false,
                'message' => 'Surat hanya dapat dibuat untuk pengajuan yang sudah DISETUJUI.',
            ], 422);
        }

        /*
         * Gunakan PDF yang sudah tersimpan pada disk private.
         */
        if (
            !empty($permit->surat_pdf_path)
            && Storage::disk('local')->exists($permit->surat_pdf_path)
        ) {
            return response()->json([
                'success' => true,
                'message' => 'Surat izin sudah tersedia.',
                'data' => [
                    'permit' => $permit,
                    'file_path' => $permit->surat_pdf_path,
                    'download_url' => route(
                        'permits.pdf.download',
                        ['permit' => $permit->id]
                    ),
                ],
            ]);
        }

        /*
         * Kompatibilitas dengan PDF lama pada disk public.
         */
        if (
            !empty($permit->surat_pdf_path)
            && Storage::disk('public')->exists($permit->surat_pdf_path)
        ) {
            return response()->json([
                'success' => true,
                'message' => 'Surat izin sudah tersedia.',
                'data' => [
                    'permit' => $permit,
                    'file_path' => $permit->surat_pdf_path,
                    'download_url' => route(
                        'permits.pdf.download',
                        ['permit' => $permit->id]
                    ),
                ],
            ]);
        }

        $permit->load([
            'user.role',
            'user.unit',
            'approvals.approver.role',
        ]);

        if (!$permit->user) {
            return response()->json([
                'success' => false,
                'message' => 'Data pemohon izin tidak ditemukan.',
            ], 422);
        }

        /*
         * Template dipilih berdasarkan role pemohon izin.
         */
        $rolePemohon = $permit->user->role?->name;

        $template = in_array(
            $rolePemohon,
            ['Hakim', 'Ketua/Wakil Ketua'],
            true
        )
            ? 'pdf.surat-izin-hakim'
            : 'pdf.surat-izin-pegawai';

        $fileName = 'surat-izin-'
            . $permit->id
            . '-'
            . now()->format('YmdHis')
            . '.pdf';

        $filePath = 'surat-izin/' . $fileName;

        try {
            $pdf = Pdf::loadView(
                $template,
                ['permit' => $permit]
            );

            $pdfContent = $pdf->output();
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat PDF. Periksa template dan log aplikasi.',
            ], 500);
        }

        $saved = Storage::disk('local')->put(
            $filePath,
            $pdfContent
        );

        if (!$saved) {
            return response()->json([
                'success' => false,
                'message' => 'File surat izin gagal disimpan. Status pengajuan tidak diubah.',
            ], 500);
        }

        try {
            $permit->update([
                'surat_pdf_path' => $filePath,
                'status' => 'SURAT TERSEDIA',
            ]);
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($filePath);

            throw $exception;
        }

        $permit->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Surat izin berhasil dibuat.',
            'data' => [
                'permit' => $permit,
                'file_path' => $filePath,
                'download_url' => route(
                    'permits.pdf.download',
                    ['permit' => $permit->id]
                ),
            ],
        ]);
    }

    /**
     * Download surat izin.
     *
     * Akses:
     * - Pemilik izin.
     * - Pengguna dengan permission approve_permit.
     * - Admin dengan permission view_all_permits.
     */
    public function download(
        Request $request,
        Permit $permit
    ): Response {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Autentikasi diperlukan.',
            ], 401);
        }

        /*
         * Ambil Role terbaru langsung dari database.
         */
        $role = $this->getFreshRole($user);

        if (!$role || !$role->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Role pengguna tidak aktif atau tidak tersedia.',
            ], 403);
        }

        $isOwner =
            (string) $permit->user_id === (string) $user->id;

        $canApprove = $role->permissions->contains(
            fn ($permission) =>
                $permission->name === 'approve_permit'
                && (bool) $permission->is_active
        );

        $canViewAll = $role->permissions->contains(
            fn ($permission) =>
                $permission->name === 'view_all_permits'
                && (bool) $permission->is_active
        );

        if (!$isOwner && !$canApprove && !$canViewAll) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengunduh surat ini.',
            ], 403);
        }

        /*
         * Surat hanya tersedia pada status berikut.
         */
        $allowedStatuses = [
            'SURAT TERSEDIA',
            'SEDANG IZIN',
            'MENUNGGU PENYELESAIAN',
            'SELESAI',
        ];

        if (
            !in_array($permit->status, $allowedStatuses, true)
            || empty($permit->surat_pdf_path)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Surat izin belum tersedia.',
            ], 404);
        }

        $path = $permit->surat_pdf_path;

        /*
         * Batasi akses hanya ke direktori surat-izin.
         */
        if (
            str_contains($path, '..')
            || str_starts_with($path, '/')
            || !str_starts_with($path, 'surat-izin/')
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Lokasi file surat tidak valid.',
            ], 404);
        }

        /*
         * Prioritaskan disk private.
         */
        $disk = Storage::disk('local');

        if (!$disk->exists($path)) {
            $disk = Storage::disk('public');
        }

        if (!$disk->exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'File surat tidak ditemukan.',
            ], 404);
        }

        $actualPath = $disk->path($path);

        if (!is_file($actualPath) || !is_readable($actualPath)) {
            return response()->json([
                'success' => false,
                'message' => 'File surat tidak ditemukan atau tidak dapat dibaca.',
            ], 404);
        }

        $mimeType = mime_content_type($actualPath);

        if ($mimeType !== 'application/pdf') {
            return response()->json([
                'success' => false,
                'message' => 'Format file surat tidak valid.',
            ], 415);
        }

        return response()->file($actualPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' =>
                'attachment; filename="surat-izin-'
                . $permit->id
                . '.pdf"',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-store, max-age=0',
            'Pragma' => 'no-cache',
            'X-Frame-Options' => 'DENY',
        ]);
    }
}
