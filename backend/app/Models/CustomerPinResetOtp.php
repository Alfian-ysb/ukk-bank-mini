<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerPinResetOtp extends Model
{
    protected $fillable = [
        'customer_id',
        'purpose',
        'challenge_id',
        'code_hash',
        'pending_email',
        'expires_at',
        'last_sent_at',
        'attempts',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'last_sent_at' => 'datetime',
            'attempts' => 'integer',
            'used_at' => 'datetime',
        ];
    }
}
