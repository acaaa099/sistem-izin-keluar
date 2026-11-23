<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Permit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'approval_target_id',
        'jenis_izin',
        'tanggal_izin',
        'jam_keluar',
        'estimasi_kembali',
        'jam_kembali',
        'alasan',
        'status',
        'surat_pdf_path',
        'submitted_at',
        'approved_at',
        'completed_at',
    ];

    protected $casts = [
        'tanggal_izin' => 'date',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approvalTarget(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approval_target_id');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(Approval::class);
    }

    public function evidences(): HasMany
    {
        return $this->hasMany(PermitEvidence::class);
    }
}