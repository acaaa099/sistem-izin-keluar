<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Approval;
use App\Models\Permit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class ApprovalController extends Controller
{
    /**
     * Memproses approval pengajuan izin.
     *
     * Tujuan approval sudah ditentukan ketika pengajuan dibuat
     * melalui permits.approval_target_id.
     *
     * Aturan:
     *
     * Staff/Pegawai
     * -> Kasubag
     *
     * Kasubag
     * -> Sekretaris
     *
     * Panmud
     * -> Panitera
     *
     * Panitera/Sekretaris/Hakim
     * -> Ketua atau Wakil Ketua sesuai pilihan pemohon
     *
     * Wakil Ketua
     * -> Ketua
     */
    public function store(
        Request $request,
        Permit $permit
    ): JsonResponse {
        $validated = $request->validate([
            'action' => [
                'required',
                'string',
                Rule::in([
                    'APPROVE',
                    'REVISI',
                    'TOLAK',
                ]),
            ],

            'catatan' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $user = $request->user();

        // --------------------------------------------------
        // LOAD DATA
        // --------------------------------------------------

        $permit->loadMissing([
            'user.role',
            'user.supervisor',
            'approvalTarget.role',
            'approvalTarget.supervisor',
        ]);

        $user->loadMissing([
            'role.permissions',
            'supervisor',
        ]);

        // --------------------------------------------------
        // PERMISSION BERDASARKAN TINDAKAN
        // --------------------------------------------------

        $permissionByAction = [
            'APPROVE' => 'approve_permit',
            'REVISI' => 'revise_permit',
            'TOLAK' => 'reject_permit',
        ];

        $requiredPermission =
            $permissionByAction[$validated['action']];

        $role = $user->role;

        $hasPermission =
            $role
            && $role->is_active
            && $role->permissions->contains(
                fn ($permission) =>
                    $permission->name === $requiredPermission
                    && (bool) $permission->is_active
            );

        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki permission untuk melakukan tindakan ini.',
            ], 403);
        }

        // --------------------------------------------------
        // TIDAK BOLEH MEMPROSES IZIN SENDIRI
        // --------------------------------------------------

        if ((string) $permit->user_id === (string) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak dapat memproses pengajuan izinnya sendiri.',
            ], 403);
        }

        // --------------------------------------------------
        // STATUS HARUS DIAJUKAN
        // --------------------------------------------------

        if ($permit->status !== 'DIAJUKAN') {
            return response()->json([
                'success' => false,
                'message' => 'Pengajuan hanya dapat diproses ketika berstatus DIAJUKAN.',
            ], 422);
        }

        // --------------------------------------------------
        // PEMOHON HARUS ADA
        // --------------------------------------------------

        if (!$permit->user) {
            return response()->json([
                'success' => false,
                'message' => 'Data pemohon tidak ditemukan.',
            ], 422);
        }

        // --------------------------------------------------
        // TARGET APPROVAL HARUS ADA
        // --------------------------------------------------

        if (!$permit->approval_target_id) {
            return response()->json([
                'success' => false,
                'message' => 'Tujuan persetujuan pada pengajuan ini belum ditentukan. Silakan hubungi Admin Sistem.',
            ], 422);
        }

        $approvalTarget = $permit->approvalTarget;

        if (!$approvalTarget || !$approvalTarget->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Pejabat tujuan persetujuan tidak ditemukan atau sudah tidak aktif. Silakan hubungi Admin Sistem.',
            ], 422);
        }

        // --------------------------------------------------
        // USER HARUS MENJADI TARGET APPROVAL
        // --------------------------------------------------

        if ((string) $permit->approval_target_id !== (string) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda bukan pejabat yang dituju untuk memproses pengajuan ini.',
            ], 403);
        }

        // --------------------------------------------------
        // CATATAN WAJIB UNTUK REVISI / TOLAK
        // --------------------------------------------------

        if (
            in_array(
                $validated['action'],
                ['REVISI', 'TOLAK'],
                true
            )
            && empty(
                trim(
                    (string) (
                        $validated['catatan']
                        ?? ''
                    )
                )
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Catatan wajib diisi untuk tindakan REVISI atau TOLAK.',
            ], 422);
        }

        // --------------------------------------------------
        // REVISI
        // --------------------------------------------------

        if ($validated['action'] === 'REVISI') {
            $approval = DB::transaction(
                function () use (
                    $permit,
                    $user,
                    $validated
                ) {
                    $approval = Approval::create([
                        'permit_id' => $permit->id,
                        'approver_id' => $user->id,
                        'action' => 'REVISI',
                        'catatan' => trim(
                            (string) $validated['catatan']
                        ),
                        'acted_at' => now(),
                    ]);

                    $permit->update([
                        'status' => 'REVISI',
                        'approved_at' => null,
                    ]);

                    return $approval;
                }
            );

            $this->loadPermitResponse($permit);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan izin dikembalikan untuk diperbaiki.',
                'data' => [
                    'permit' => $permit,
                    'approval' => $approval,
                ],
            ]);
        }

        // --------------------------------------------------
        // TOLAK
        // --------------------------------------------------

        if ($validated['action'] === 'TOLAK') {
            $approval = DB::transaction(
                function () use (
                    $permit,
                    $user,
                    $validated
                ) {
                    $approval = Approval::create([
                        'permit_id' => $permit->id,
                        'approver_id' => $user->id,
                        'action' => 'TOLAK',
                        'catatan' => trim(
                            (string) $validated['catatan']
                        ),
                        'acted_at' => now(),
                    ]);

                    $permit->update([
                        'status' => 'DITOLAK',
                        'approved_at' => null,
                    ]);

                    return $approval;
                }
            );

            $this->loadPermitResponse($permit);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan izin berhasil ditolak.',
                'data' => [
                    'permit' => $permit,
                    'approval' => $approval,
                ],
            ]);
        }

        // --------------------------------------------------
        // APPROVE
        // --------------------------------------------------

        $approval = DB::transaction(
            function () use (
                $permit,
                $user,
                $validated
            ) {
                $approval = Approval::create([
                    'permit_id' => $permit->id,
                    'approver_id' => $user->id,
                    'action' => 'APPROVE',
                    'catatan' => isset($validated['catatan'])
                        ? trim(
                            (string) $validated['catatan']
                        )
                        : null,
                    'acted_at' => now(),
                ]);

                /*
                 * Semua pengajuan yang sudah diproses oleh
                 * approval_target dianggap selesai pada tahap
                 * persetujuan.
                 *
                 * Tidak ada approval berjenjang tambahan
                 * setelah target yang dipilih menyetujui.
                 */
                $permit->update([
                    'status' => 'DISETUJUI',
                    'approved_at' => now(),
                ]);

                return $approval;
            }
        );

        $this->loadPermitResponse($permit);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan izin berhasil disetujui.',
            'data' => [
                'permit' => $permit,
                'approval' => $approval,
                'next_approver' => null,
            ],
        ]);
    }

    /**
     * Load data lengkap untuk response API.
     */
    private function loadPermitResponse(
        Permit $permit
    ): void {
        $permit->load([
            'user.role',
            'user.unit',
            'user.supervisor',
            'approvalTarget.role',
            'approvalTarget.unit',
            'approvalTarget.supervisor',
            'approvals.approver.role',
            'approvals.approver.unit',
            'approvals.approver.supervisor',
            'evidences',
        ]);
    }
}