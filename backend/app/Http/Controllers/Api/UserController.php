<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Menampilkan daftar pengguna dengan pencarian, filter, dan pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $roleId = $request->query('role_id');
        $unitId = $request->query('unit_id');
        $status = $request->query('status');

        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);

        $users = User::query()
            ->select([
                'id', 'name', 'username', 'email', 'nip', 'jabatan',
                'pangkat_golongan', 'role_id', 'unit_id',
                'supervisor_id', 'is_active',
            ])
            ->with(['role:id,name', 'unit:id,name'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->when(
                $roleId !== null && $roleId !== '',
                fn ($query) => $query->where('role_id', $roleId)
            )
            ->when(
                $unitId !== null && $unitId !== '',
                fn ($query) => $query->where('unit_id', $unitId)
            )
            ->when(
                $status === 'active',
                fn ($query) => $query->where('is_active', true)
            )
            ->when(
                $status === 'inactive',
                fn ($query) => $query->where('is_active', false)
            )
            ->orderBy('name')
            ->paginate($perPage);

        $roles = Role::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $units = Unit::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengguna berhasil diambil.',
            'data' => [
                'users' => $users->items(),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ],
                'filters' => [
                    'roles' => $roles,
                    'units' => $units,
                ],
            ],
        ]);
    }

    /**
     * Menampilkan detail satu pengguna.
     */
    public function show(string $id): JsonResponse
    {
        $user = User::query()
            ->select([
                'id', 'name', 'username', 'email', 'nip', 'jabatan',
                'pangkat_golongan', 'role_id', 'unit_id', 'supervisor_id',
                'is_active', 'created_at', 'updated_at',
            ])
            ->with([
                'role:id,name',
                'unit:id,name',
                'supervisor:id,name',
            ])
            ->whereKey($id)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail pengguna berhasil diambil.',
            'data' => ['user' => $user],
        ]);
    }

    /**
     * Membuat akun pengguna baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required', 'string', 'max:255', 'alpha_dash',
                Rule::unique('users', 'username'),
            ],
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('users', 'email'),
            ],
            'nip' => [
                'nullable', 'string', 'max:255',
                Rule::unique('users', 'nip'),
            ],
            'jabatan' => ['nullable', 'string', 'max:255'],
            'pangkat_golongan' => ['nullable', 'string', 'max:255'],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'unit_id' => ['required', 'integer', 'exists:units,id'],
            'supervisor_id' => [
                'nullable', 'string', 'exists:users,id',
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $role = Role::find($validated['role_id']);
        $unit = Unit::find($validated['unit_id']);

        if (!$role || !$role->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Role tidak ditemukan atau sedang tidak aktif.',
            ], 422);
        }

        if (!$unit || !$unit->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Unit tidak ditemukan atau sedang tidak aktif.',
            ], 422);
        }

        if (!empty($validated['supervisor_id'])) {
            $supervisor = User::find($validated['supervisor_id']);

            if (!$supervisor || !$supervisor->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Atasan tidak ditemukan atau sedang tidak aktif.',
                ], 422);
            }
        }

        $validated['is_active'] = $validated['is_active'] ?? true;
        unset($validated['password_confirmation']);

        $user = User::create($validated);
        $user->load(['role:id,name', 'unit:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil ditambahkan.',
            'data' => ['user' => $user],
        ], 201);
    }

    /**
     * Memperbarui data pengguna.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'username' => [
                'sometimes', 'required', 'string', 'max:255', 'alpha_dash',
                Rule::unique('users', 'username')->ignore($user->id, 'id'),
            ],
            'email' => [
                'sometimes', 'required', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($user->id, 'id'),
            ],
            'nip' => [
                'sometimes', 'nullable', 'string', 'max:255',
                Rule::unique('users', 'nip')->ignore($user->id, 'id'),
            ],
            'jabatan' => ['sometimes', 'nullable', 'string', 'max:255'],
            'pangkat_golongan' => [
                'sometimes', 'nullable', 'string', 'max:255',
            ],
            'role_id' => [
                'sometimes', 'required', 'integer', 'exists:roles,id',
            ],
            'unit_id' => [
                'sometimes', 'required', 'integer', 'exists:units,id',
            ],
            'supervisor_id' => [
                'sometimes', 'nullable', 'string', 'exists:users,id',
            ],
            'password' => [
                'sometimes', 'nullable', 'string', 'min:8', 'confirmed',
            ],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (
            array_key_exists('role_id', $validated)
            && !Role::whereKey($validated['role_id'])
                ->where('is_active', true)->exists()
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Role tidak ditemukan atau sedang tidak aktif.',
            ], 422);
        }

        if (
            array_key_exists('unit_id', $validated)
            && !Unit::whereKey($validated['unit_id'])
                ->where('is_active', true)->exists()
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unit tidak ditemukan atau sedang tidak aktif.',
            ], 422);
        }

        if (array_key_exists('supervisor_id', $validated)) {
            if (
                $validated['supervisor_id'] !== null
                && (string) $validated['supervisor_id'] === (string) $user->id
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengguna tidak dapat menjadi atasannya sendiri.',
                ], 422);
            }

            if ($validated['supervisor_id'] !== null) {
                $supervisor = User::find($validated['supervisor_id']);

                if (!$supervisor || !$supervisor->is_active) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Atasan tidak ditemukan atau sedang tidak aktif.',
                    ], 422);
                }
            }
        }

        if (isset($validated['password']) && $validated['password'] === '') {
            unset($validated['password']);
        }

        unset($validated['password_confirmation']);

        $user->fill($validated);
        $user->save();
        $user->load(['role:id,name', 'unit:id,name', 'supervisor:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'Data pengguna berhasil diperbarui.',
            'data' => ['user' => $user],
        ]);
    }

    /**
     * Mengaktifkan atau menonaktifkan akun tanpa menghapus data.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        if (
            (string) $request->user()->getKey() === (string) $user->getKey()
            && !$validated['is_active']
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menonaktifkan akun sendiri.',
            ], 422);
        }

        $user->is_active = $validated['is_active'];
        $user->save();

        // Cabut seluruh token saat akun dinonaktifkan.
        if (!$user->is_active) {
            $user->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => $user->is_active
                ? 'Akun pengguna berhasil diaktifkan.'
                : 'Akun pengguna berhasil dinonaktifkan.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'is_active' => $user->is_active,
                ],
            ],
        ]);
    }

    /**
     * Menghapus pengguna permanen hanya jika tidak memiliki relasi penting.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        if (
            (string) $request->user()->getKey()
            === (string) $user->getKey()
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun sendiri.',
            ], 422);
        }

        $hasPermits = DB::table('permits')
            ->where('user_id', $user->id)
            ->orWhere('approval_target_id', $user->id)
            ->exists();

        $hasApprovals = DB::table('approvals')
            ->where('approver_id', $user->id)
            ->exists();

        $hasPositions = DB::table('user_positions')
            ->where('user_id', $user->id)
            ->exists();

        $isSupervisor = User::where('supervisor_id', $user->id)->exists();

        if ($hasPermits || $hasApprovals || $hasPositions || $isSupervisor) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna masih memiliki riwayat atau relasi. Nonaktifkan akun sebagai gantinya.',
            ], 409);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil dihapus.',
        ]);
    }
}
