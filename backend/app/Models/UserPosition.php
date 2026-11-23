<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPosition extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'position_name',
        'position_type',
        'is_primary',
        'is_active',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * User yang memiliki jabatan ini.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}