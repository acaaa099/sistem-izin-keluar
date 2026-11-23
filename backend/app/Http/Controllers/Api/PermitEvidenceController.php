<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permit;
use App\Models\PermitEvidence;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class PermitEvidenceController extends Controller
{
    /**
     * Upload bukti pengajuan izin ke penyimpanan privat.
     */
    public function store(Request $request, Permit $permit): JsonResponse
    {
        $user = $request->user();

        if (!$user || (string) $permit->user_id !== (string) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke pengajuan izin ini.',
            ], 403);
        }

        $validated = $request->validate([
            'type' => [
                'required',
                'string',
                Rule::in([
                    'ACTIVITY_PHOTO',
                    'RETURN_PHOTO',
                    'SIGNED_LETTER_PHOTO',
                ]),
            ],
            'file' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
            'image' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
            'jam_kembali' => [
                'nullable',
                'date_format:H:i',
            ],
        ]);

        // Frontend saat ini mengirim field "image" dan "file".
        // Gunakan "file" terlebih dahulu agar tetap kompatibel.
        $fileInput = $request->file('file') ?? $request->file('image');

        if (!$fileInput) {
            return response()->json([
                'success' => false,
                'message' => 'File foto bukti wajib diunggah.',
            ], 422);
        }

        $type = $validated['type'];

        if (
            $type === 'ACTIVITY_PHOTO'
            && !in_array($permit->status, [
                'SURAT TERSEDIA',
                'SEDANG IZIN',
            ], true)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Foto aktivitas hanya dapat diunggah setelah surat tersedia.',
            ], 422);
        }

        if (
            $type === 'RETURN_PHOTO'
            && !in_array($permit->status, [
                'SEDANG IZIN',
                'MENUNGGU PENYELESAIAN',
            ], true)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Foto bukti kembali hanya dapat diunggah saat izin berlangsung atau menunggu penyelesaian.',
            ], 422);
        }

        if (
            $type === 'RETURN_PHOTO'
            && empty($validated['jam_kembali'])
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Jam kembali wajib diisi untuk foto bukti kembali.',
            ], 422);
        }

        if (
            $type === 'SIGNED_LETTER_PHOTO'
            && $permit->status !== 'MENUNGGU PENYELESAIAN'
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Foto surat bertanda tangan hanya dapat diunggah pada tahap penyelesaian.',
            ], 422);
        }

        $filePath = null;

        try {
            // Simpan file pada disk privat Laravel.
            $filePath = $fileInput->store(
                'permit-evidences/' . $permit->id,
                'local'
            );

            if (!$filePath) {
                return response()->json([
                    'success' => false,
                    'message' => 'File bukti gagal disimpan. Silakan coba kembali.',
                ], 500);
            }

            $evidence = DB::transaction(function () use (
                $permit,
                $type,
                $filePath,
                $validated
            ) {
                $evidence = $permit->evidences()->create([
                    'type' => $type,
                    'file_path' => $filePath,
                    'captured_at' => now(),
                ]);

                if ($type === 'ACTIVITY_PHOTO') {
                    $permit->update([
                        'status' => 'SEDANG IZIN',
                    ]);
                }

                if ($type === 'RETURN_PHOTO') {
                    $permit->update([
                        'jam_kembali' => $validated['jam_kembali'],
                        'status' => 'MENUNGGU PENYELESAIAN',
                    ]);
                }

                // SIGNED_LETTER_PHOTO tidak mengubah status.
                // Status SELESAI tetap ditangani endpoint complete.

                return $evidence;
            });

            $secureFileUrl = route('permits.evidences.file', [
                'permit' => $permit->id,
                'evidence' => $evidence->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => match ($type) {
                    'ACTIVITY_PHOTO' => 'Foto aktivitas berhasil diunggah.',
                    'RETURN_PHOTO' => 'Foto bukti kembali berhasil diunggah.',
                    'SIGNED_LETTER_PHOTO' => 'Foto surat bertanda tangan berhasil diunggah.',
                },
                'data' => [
                    'permit' => $permit->fresh(),
                    'evidence' => [
                        'id' => $evidence->id,
                        'permit_id' => $evidence->permit_id,
                        'type' => $evidence->type,
                        'captured_at' => $evidence->captured_at,
                        'secure_file_url' => $secureFileUrl,
                        'file_url' => $secureFileUrl,
                    ],
                ],
            ], 201);
        } catch (Throwable $exception) {
            if ($filePath) {
                Storage::disk('local')->delete($filePath);
            }

            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Bukti gagal diproses. Silakan coba kembali.',
            ], 500);
        }
    }

    /**
     * Menampilkan bukti melalui endpoint terautentikasi.
     * File tetap privat; isi gambar dinormalisasi menjadi JPEG standar
     * sebelum dikirim agar dapat dibaca browser secara konsisten.
     */
    public function show(
        Request $request,
        Permit $permit,
        PermitEvidence $evidence
    ): Response {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Autentikasi diperlukan.',
            ], 401);
        }

        $user->loadMissing('role.permissions');
        $permit->loadMissing(['user.role.permissions', 'user.supervisor']);

        if ((int) $evidence->permit_id !== (int) $permit->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bukti tidak ditemukan pada pengajuan ini.',
            ], 404);
        }

        $owner = $permit->user;
        $isOwner = (string) $permit->user_id === (string) $user->id;

        $canViewAll = $this->hasPermission(
            $user,
            'view_all_permits'
        );

        $isAssignedApprover =
            ($permit->approval_target_id !== null
                && (string) $permit->approval_target_id === (string) $user->id)
            && $this->hasPermission($user, 'approve_permit');

        $isDirectSupervisor =
            $owner !== null
            && $owner->supervisor_id !== null
            && (string) $owner->supervisor_id === (string) $user->id
            && $this->hasPermission($user, 'view_subordinate_permits');

        if (
            !$isOwner
            && !$canViewAll
            && !$isAssignedApprover
            && !$isDirectSupervisor
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk melihat bukti izin ini.',
            ], 403);
        }

        // Cari file pada disk privat terlebih dahulu.
        $path = $evidence->file_path;
        $disk = Storage::disk('local');
        $actualPath = null;

        if ($disk->exists($path)) {
            $actualPath = $disk->path($path);
        } else {
            // Kompatibilitas dengan file lama yang mungkin tersimpan di disk public.
            $legacyDisk = Storage::disk('public');

            if ($legacyDisk->exists($path)) {
                $actualPath = $legacyDisk->path($path);
                $disk = $legacyDisk;
            }
        }

        if (!$actualPath || !is_file($actualPath) || !is_readable($actualPath)) {
            return response()->json([
                'success' => false,
                'message' => 'File bukti tidak ditemukan atau tidak dapat dibaca.',
            ], 404);
        }

        // Pastikan file benar-benar salah satu format gambar yang didukung.
        $originalMime = mime_content_type($actualPath)
            ?: $disk->mimeType($path)
            ?: 'application/octet-stream';

        $allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (!in_array($originalMime, $allowedMimeTypes, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Format file bukti tidak didukung.',
            ], 415);
        }

        if (!function_exists('imagecreatefromstring') || !function_exists('imagejpeg')) {
            report(new \RuntimeException('PHP GD extension with JPEG support is required to normalize evidence images.'));

            return response()->json([
                'success' => false,
                'message' => 'Pemrosesan gambar pada server belum tersedia. Hubungi administrator.',
            ], 500);
        }

        $originalContent = file_get_contents($actualPath);

        if ($originalContent === false || $originalContent === '') {
            return response()->json([
                'success' => false,
                'message' => 'Isi file bukti gagal dibaca.',
            ], 500);
        }

        // Decode lalu encode ulang menjadi JPEG standar.
        // Langkah ini tidak mengubah file asli yang tersimpan di disk.
        $sourceImage = @imagecreatefromstring($originalContent);

        if ($sourceImage === false) {
            return response()->json([
                'success' => false,
                'message' => 'File ditemukan, tetapi isi gambar tidak dapat diproses.',
            ], 415);
        }

        $normalizedImage = null;
        $imageContent = false;

        try {
            $width = imagesx($sourceImage);
            $height = imagesy($sourceImage);

            if ($width < 1 || $height < 1) {
                throw new \RuntimeException('Dimensi gambar tidak valid.');
            }

            // JPEG tidak mendukung transparansi, sehingga area transparan
            // dari PNG/WEBP diratakan menggunakan latar putih.
            $normalizedImage = imagecreatetruecolor($width, $height);

            if ($normalizedImage === false) {
                throw new \RuntimeException('Gagal membuat kanvas gambar.');
            }

            $white = imagecolorallocate($normalizedImage, 255, 255, 255);
            imagefill($normalizedImage, 0, 0, $white);

            imagecopy(
                $normalizedImage,
                $sourceImage,
                0,
                0,
                0,
                0,
                $width,
                $height
            );

            // Tulis hasil encoding ke file sementara, bukan output buffer.
            $temporaryPath = tempnam(sys_get_temp_dir(), 'permit_evidence_');

            if ($temporaryPath === false) {
                throw new \RuntimeException('Tidak dapat membuat file sementara untuk gambar.');
            }

            try {
                $encodedSuccessfully = imagejpeg($normalizedImage, $temporaryPath, 90);

                if (!$encodedSuccessfully) {
                    throw new \RuntimeException('Gagal mengubah gambar menjadi JPEG.');
                }

                $encodedContent = file_get_contents($temporaryPath);

                if (!is_string($encodedContent) || $encodedContent === '') {
                    throw new \RuntimeException('Hasil JPEG sementara kosong atau tidak dapat dibaca.');
                }

                // JPEG standar harus diawali SOI (FFD8) dan diakhiri EOI (FFD9).
                if (
                    strlen($encodedContent) < 4
                    || substr($encodedContent, 0, 2) !== "\xFF\xD8"
                    || substr($encodedContent, -2) !== "\xFF\xD9"
                ) {
                    throw new \RuntimeException('Hasil encoding bukan JPEG lengkap (penanda SOI/EOI tidak valid).');
                }

                $imageContent = $encodedContent;
            } finally {
                if (is_file($temporaryPath)) {
                    @unlink($temporaryPath);
                }
            }
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Gambar ditemukan, tetapi gagal dinormalisasi oleh server.',
            ], 500);
        } finally {
            if ($normalizedImage !== null && $normalizedImage !== false) {
                imagedestroy($normalizedImage);
            }

            imagedestroy($sourceImage);
        }

        // Bersihkan output tak sengaja (misalnya whitespace dari file PHP lain)
        // yang mungkin masih tertahan di output buffer sebelum respons gambar dikirim.
        // Jika ada output non-whitespace, catat ke log agar sumbernya dapat ditelusuri.
        if (ob_get_level() > 0) {
            $pendingOutput = ob_get_contents();

            if (is_string($pendingOutput) && $pendingOutput !== '') {
                if (trim($pendingOutput) !== '') {
                    report(new \RuntimeException(
                        'Unexpected output detected before sending permit evidence image.'
                    ));
                }

                ob_clean();
            }
        }

        return response($imageContent, 200, [
            'Content-Type' => 'image/jpeg',
            'Content-Length' => (string) strlen($imageContent),
            'Content-Disposition' => 'inline; filename="evidence-' . $evidence->id . '.jpg"',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-store, max-age=0',
            'Pragma' => 'no-cache',
            'X-Frame-Options' => 'DENY',

            // Header diagnostik sementara. Dapat dibaca JavaScript lintas origin.
            'Access-Control-Expose-Headers' => 'X-Evidence-Debug, X-Evidence-Bytes, X-Evidence-Start, X-Evidence-End',
            'X-Evidence-Debug' => 'NORMALIZED-V2',
            'X-Evidence-Bytes' => (string) strlen($imageContent),
            'X-Evidence-Start' => bin2hex(substr($imageContent, 0, 2)),
            'X-Evidence-End' => bin2hex(substr($imageContent, -2)),
        ]);
    }

    /**
     * Memeriksa permission pengguna melalui relasi role.
     */
    private function hasPermission($user, string $permission): bool
    {
        $user->loadMissing('role.permissions');

        return $user->role
            && $user->role->permissions->contains(
                fn ($item) =>
                    $item->name === $permission
                    && (bool) $item->is_active
            );
    }
}