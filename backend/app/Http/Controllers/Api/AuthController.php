<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        /*
         * LOGIN BARU:
         * Menggunakan email sebagai identitas login.
         *
         * KOMPATIBILITAS SEMENTARA:
         * Tetap menerima username dari frontend lama
         * sampai Jova menyelesaikan perubahan frontend.
         */

        if ($request->input('email') !== null) {
            $validated = $request->validate([
                'email' => ['required', 'string', 'email'],
                'password' => ['required', 'string'],
            ]);

            $identifier = strtolower(trim($validated['email']));
            $loginColumn = 'email';
        } else {
            $validated = $request->validate([
                'username' => ['required', 'string'],
                'password' => ['required', 'string'],
            ]);

            $identifier = trim($validated['username']);

            // Mendukung email yang masih dikirim melalui
            // properti username oleh frontend lama.
            $loginColumn = filter_var(
                $identifier,
                FILTER_VALIDATE_EMAIL
            ) ? 'email' : 'username';

            if ($loginColumn === 'email') {
                $identifier = strtolower($identifier);
            }
        }

        $user = User::with([
            'role.permissions',
            'unit',
            'activePositions',
        ])
            ->where($loginColumn, $identifier)
            ->first();

        if (
            !$user ||
            !$user->is_active ||
            !Hash::check($validated['password'], $user->password)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Email/username atau password salah.',
            ], 401);
        }

        // Hapus token lama milik pengguna sebelum membuat token baru.
        $user->tokens()->delete();

        $token = $user->createToken('izin-keluar-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'role.permissions',
            'unit',
            'activePositions',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }
}
