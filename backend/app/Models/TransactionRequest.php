<?php

namespace App\Models;

use App\Enums\TransactionRequestStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'customer_id',
    'user_id',
    'shift_id',
    'transaction_type',
    'amount',
    'status',
    'expires_at',
    'approved_at',
    'rejected_at',
    'completed_at',
])]
class TransactionRequest extends Model
{
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'status' => TransactionRequestStatus::class,
            'expires_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function teller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

}
