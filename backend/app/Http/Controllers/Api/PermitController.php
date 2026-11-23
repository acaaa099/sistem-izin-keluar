<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permit;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PermitController extends Controller
{
    /**
     * Memeriksa apakah user memiliki permission tertentu yang aktif.
     */
    private function hasPermission(User $user, string $permission): bool
    {
        $user->loadMissing('role.permissions');

        if (!$user->role || !$user->role->is_active) {
            return false;
        }

        return $user->role->permissions->contains(
            fn ($item) =>
                $item->name === $permission
                && (bool) $item->is_active
        );
    }

    /**
     * Memastikan target Pimpinan memiliki jabatan aktif yang valid.
     */
    private function isValidLeadershipTarget(?User $target): bool
    {
        if (
            !$target
            || !$target->is_active
            || (int) $target->role_id !== 2
            || !$this->hasPermission($target, 'approve_permit')
        ) {
            return false;
        }

        if (!$target->role || !$target->role->is_active) {
            return false;
        }

        return $target->activePositions()
            ->whereIn('position_name', ['Ketua', 'Wakil Ketua'])
            ->exists();
    }
    /**
     * Memvalidasi tanggal dan jam izin terhadap waktu sekarang.
     */
    private function validatePermitDateTime(array $validated): ?JsonResponse
    {
        $tanggalIzin = Carbon::parse($validated['tanggal_izin'])->startOfDay();
        $hariIni = Carbon::today();

        if ($tanggalIzin->lt($hariIni)) {
            return response()->json([
                'success' => false,
                'message' => 'Tanggal izin tidak boleh sebelum hari ini.',
                'errors' => [
                    'tanggal_izin' => ['Tanggal izin tidak boleh sebelum hari ini.'],
                ],
            ], 422);
        }

        if ($tanggalIzin->isSameDay($hariIni)) {
            $waktuKeluar = Carbon::parse(
                $validated['tanggal_izin'] . ' ' . $validated['jam_keluar']
            );

            if ($waktuKeluar->lessThanOrEqualTo(now())) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jam keluar harus lebih besar daripada waktu saat ini.',
                    'errors' => [
                        'jam_keluar' => [
                            'Jam keluar sudah terlewati. Silakan pilih jam yang akan datang.',
                        ],
                    ],
                ], 422);
            }
        }

        return null;
    }

    /**
     * Menentukan target otomatis dari atasan langsung.
     * Hakim, Panitera, dan Sekretaris memilih Ketua/Wakil Ketua.
     */
    private function resolveAutomaticApprovalTarget(User $user): ?User
    {
        if (in_array((int) $user->role_id, [3, 4, 5], true)) {
            return null;
        }

        $user->loadMissing('supervisor');
        $target = $user->supervisor;

        if (!$target || !$target->is_active) {
            return null;
        }

        if (!$this->hasPermission($target, 'approve_permit')) {
            return null;
        }

        return $target;
    }

    /**
     * Menampilkan daftar pengajuan berdasarkan cakupan yang diminta.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->loadMissing('role.permissions');

        $canViewAll = $this->hasPermission($user, 'view_all_permits');
        $canViewSubordinates = $this->hasPermission($user, 'view_subordinate_permits');
        $canViewOwn = $this->hasPermission($user, 'view_own_permits');
        $scope = $request->query('scope');

        if ($scope !== null && !in_array($scope, ['own', 'subordinates', 'all'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Cakupan data izin tidak valid.',
            ], 422);
        }

        if ($scope === 'own' && !$canViewOwn) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki permission untuk melihat izin pribadi.',
            ], 403);
        }

        if ($scope === 'subordinates' && !$canViewSubordinates) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki permission untuk memantau izin bawahan.',
            ], 403);
        }

        if ($scope === 'all' && !$canViewAll) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki permission untuk melihat semua pengajuan izin.',
            ], 403);
        }

        if (!$scope && !$canViewAll && !$canViewSubordinates && !$canViewOwn) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki permission untuk melihat pengajuan izin.',
            ], 403);
        }

        $query = Permit::with([
            'user.role',
            'user.unit',
            'user.supervisor',
            'approvalTarget.role',
        ]);

        if ($scope === 'own') {
            $query->where('user_id', $user->id);
        } elseif ($scope === 'subordinates') {
            $query->whereHas('user', function ($userQuery) use ($user) {
                $userQuery->where('supervisor_id', $user->id);
            });
        } elseif ($scope === 'all' || (!$scope && $canViewAll)) {
            // Pengguna berwenang melihat seluruh pengajuan.
        } elseif (!$scope && $canViewSubordinates) {
            // Kompatibilitas untuk pemanggil lama.
            $query->whereHas('user', function ($userQuery) use ($user) {
                $userQuery->where('supervisor_id', $user->id);
            });
        } else {
            $query->where('user_id', $user->id);
        }

        // Filter periode menggunakan tanggal pelaksanaan izin (tanggal_izin).
        // Kedua tanggal harus diisi bersama agar rentang selalu jelas.
        $dateFilters = $request->validate([
            'start_date' => ['nullable', 'date_format:Y-m-d', 'required_with:end_date'],
            'end_date' => ['nullable', 'date_format:Y-m-d', 'required_with:start_date', 'after_or_equal:start_date'],
        ]);

        if (!empty($dateFilters['start_date'])) {
            $query->whereDate('tanggal_izin', '>=', $dateFilters['start_date']);
        }

        if (!empty($dateFilters['end_date'])) {
            $query->whereDate('tanggal_izin', '<=', $dateFilters['end_date']);
        }

        $permits = $query
            ->orderByDesc('tanggal_izin')
            ->orderByDesc('id')
            ->get();

        // Jumlah pegawai dihitung berdasarkan ID pengguna yang unik,
        // bukan jumlah baris pengajuan. Ringkasan mengikuti scope dan periode.
        $totalPermits = $permits->count();
        $totalEmployees = $permits
            ->pluck('user_id')
            ->filter()
            ->unique()
            ->count();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan izin berhasil diambil.',
            'data' => [
                'permits' => $permits,
                'summary' => [
                    'total_permits' => $totalPermits,
                    'total_employees' => $totalEmployees,
                    'start_date' => $dateFilters['start_date'] ?? null,
                    'end_date' => $dateFilters['end_date'] ?? null,
                ],
            ],
        ]);
    }

    /**
     * Menampilkan detail satu pengajuan izin.
     */
    public function show(Request $request, Permit $permit): JsonResponse
    {
        $user = $request->user();
        $user->loadMissing('role.permissions');

        $canViewAll = $this->hasPermission($user, 'view_all_permits');
        $canViewSubordinates = $this->hasPermission($user, 'view_subordinate_permits');
        $canViewOwn = $this->hasPermission($user, 'view_own_permits');

        if (!$canViewAll && !$canViewSubordinates && !$canViewOwn) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki permission untuk melihat pengajuan izin.',
            ], 403);
        }

        $permit->loadMissing(['user', 'user.supervisor']);

        $isOwnPermit = (string) $permit->user_id === (string) $user->id;
        $isDirectSubordinate = $permit->user
            && (string) $permit->user->supervisor_id === (string) $user->id;

        if (!$canViewAll && !$isOwnPermit && !($canViewSubordinates && $isDirectSubordinate)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke pengajuan izin ini.',
            ], 403);
        }

        $permit->load([
            'user.role',
            'user.unit',
            'user.supervisor',
            'approvalTarget.role',
            'approvals.approver.role',
            'approvals.approver.unit',
            'evidences',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Detail pengajuan izin berhasil diambil.',
            'data' => ['permit' => $permit],
        ]);
    }

    /**
     * Memperbarui dan mengirim ulang pengajuan yang direvisi.
     */
    public function update(Request $request, Permit $permit): JsonResponse
    {
        $user = $request->user();

        if ((string) $permit->user_id !== (string) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengubah pengajuan izin ini.',
            ], 403);
        }

        if ($permit->status !== 'REVISI') {
            return response()->json([
                'success' => false,
                'message' => 'Pengajuan hanya dapat diubah ketika berstatus REVISI.',
            ], 422);
        }

        $validated = $request->validate([
            'jenis_izin' => [
                'required',
                'string',
                'max:100',
                'in:keperluan-pribadi,urusan-keluarga,urusan-dinas,lainnya',
            ],
            'tanggal_izin' => ['required', 'date'],
            'jam_keluar' => ['required', 'date_format:H:i'],
            'estimasi_kembali' => [
                'required',
                'date_format:H:i',
                'after:jam_keluar',
            ],
            'alasan' => ['required', 'string', 'min:5', 'max:1000'],
        ]);

        $dateTimeError = $this->validatePermitDateTime($validated);

        if ($dateTimeError) {
            return $dateTimeError;
        }

        // Untuk role yang memilih Ketua/Wakil Ketua, pertahankan target sebelumnya.
        if (in_array((int) $user->role_id, [3, 4, 5], true)) {
            $approvalTargetId = $permit->approval_target_id;
            $target = $approvalTargetId ? User::find($approvalTargetId) : null;

            if (!$this->isValidLeadershipTarget($target)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Target persetujuan belum valid. Silakan hubungi Admin Sistem.',
                ], 422);
            }
        } else {
            $target = $this->resolveAutomaticApprovalTarget($user);

            if (!$target) {
                return response()->json([
                    'success' => false,
                    'message' => 'Atasan langsung belum ditentukan, tidak aktif, atau tidak memiliki kewenangan menyetujui izin.',
                ], 422);
            }

            $approvalTargetId = $target->id;
        }

        $permit->update([
            'approval_target_id' => $approvalTargetId,
            'jenis_izin' => $validated['jenis_izin'],
            'tanggal_izin' => $validated['tanggal_izin'],
            'jam_keluar' => $validated['jam_keluar'],
            'estimasi_kembali' => $validated['estimasi_kembali'],
            'alasan' => $validated['alasan'],
            'status' => 'DIAJUKAN',
            'submitted_at' => now(),
            'approved_at' => null,
            'completed_at' => null,
        ]);

        $permit->load([
            'user.role',
            'user.unit',
            'user.supervisor',
            'approvalTarget.role',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan izin berhasil diperbaiki dan dikirim ulang.',
            'data' => ['permit' => $permit],
        ]);
    }

    /**
     * Menyimpan pengajuan izin baru.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'jenis_izin' => [
                'required',
                'string',
                'max:100',
                'in:keperluan-pribadi,urusan-keluarga,urusan-dinas,lainnya',
            ],
            'tanggal_izin' => ['required', 'date'],
            'jam_keluar' => ['required', 'date_format:H:i'],
            'estimasi_kembali' => [
                'required',
                'date_format:H:i',
                'after:jam_keluar',
            ],
            'alasan' => ['required', 'string', 'min:5', 'max:1000'],
        ]);

        $dateTimeError = $this->validatePermitDateTime($validated);

        if ($dateTimeError) {
            return $dateTimeError;
        }

        if (in_array((int) $user->role_id, [3, 4, 5], true)) {
            $targetData = $request->validate([
                'approval_target_id' => ['required', 'uuid', 'exists:users,id'],
            ]);

            $target = User::find($targetData['approval_target_id']);

            if (!$this->isValidLeadershipTarget($target)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pejabat yang dipilih tidak valid atau tidak memiliki kewenangan menyetujui izin.',
                ], 422);
            }

            $approvalTargetId = $target->id;
        } else {
            $target = $this->resolveAutomaticApprovalTarget($user);

            if (!$target) {
                return response()->json([
                    'success' => false,
                    'message' => 'Atasan langsung belum ditentukan, tidak aktif, atau tidak memiliki kewenangan menyetujui izin.',
                ], 422);
            }

            $approvalTargetId = $target->id;
        }

        $permit = Permit::create([
            'user_id' => $user->id,
            'approval_target_id' => $approvalTargetId,
            'jenis_izin' => $validated['jenis_izin'],
            'tanggal_izin' => $validated['tanggal_izin'],
            'jam_keluar' => $validated['jam_keluar'],
            'estimasi_kembali' => $validated['estimasi_kembali'],
            'alasan' => $validated['alasan'],
            'status' => 'DIAJUKAN',
            'submitted_at' => now(),
        ]);

        $permit->load([
            'user.role',
            'user.unit',
            'user.supervisor',
            'approvalTarget.role',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan izin berhasil dibuat.',
            'data' => ['permit' => $permit],
        ], 201);
    }
}
