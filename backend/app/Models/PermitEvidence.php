<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PermitEvidence extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database.
     */
    protected $table = 'permit_evidences';

    protected $fillable = [
        'permit_id',
        'type',
        'file_path',
        'captured_at',
    ];

    protected $casts = [
        'captured_at' => 'datetime',
    ];

    /**
     * Relasi ke pengajuan izin.
     */
    public function permit(): BelongsTo
    {
        return $this->belongsTo(Permit::class);
    }
}