<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasUuids, HasApiTokens, HasFactory, Notifiable;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'username',
        'email',
        'nip',
        'jabatan',
        'pangkat_golongan',
        'role_id',
        'unit_id',
        'supervisor_id',
        'password',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Role pengguna.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Unit kerja pengguna.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Atasan langsung pengguna.
     */
    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    /**
     * Daftar bawahan langsung pengguna.
     */
    public function subordinates(): HasMany
    {
        return $this->hasMany(User::class, 'supervisor_id');
    }

    /**
     * Daftar jabatan pengguna.
     *
     * Satu akun dapat memiliki lebih dari satu jabatan.
     * Contoh:
     * Kuncoro Tatwo Pratisto, S.H.
     * - Panmud Hukum
     * - Panmud Khusus PHI
     */
    public function positions(): HasMany
    {
        return $this->hasMany(UserPosition::class);
    }

    /**
     * Permohonan izin milik pengguna.
     */
    public function permits(): HasMany
    {
        return $this->hasMany(Permit::class);
    }

    /**
     * Riwayat persetujuan yang dilakukan pengguna.
     */
    public function approvals(): HasMany
    {
        return $this->hasMany(Approval::class, 'approver_id');
    }

    /**
     * Mengambil jabatan aktif pengguna.
     */
    public function activePositions(): HasMany
    {
        return $this->hasMany(UserPosition::class)
            ->where('is_active', true);
    }

    /**
     * Mengambil jabatan utama pengguna.
     */
    public function primaryPosition(): ?UserPosition
    {
        return $this->positions()
            ->where('is_primary', true)
            ->where('is_active', true)
            ->first();
    }
}