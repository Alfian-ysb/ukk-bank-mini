<?php

namespace App\Models;

use App\Enums\ShiftStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'shift_date',
    'status',
    'opening_balance',
    'assigned_staff',
    'total_deposits',
    'total_withdrawals',
    'closing_digital_balance',
    'closing_physical_balance',
    'difference',
    'opened_by',
    'closed_by',
    'approved_by',
    'closed_at',
    'approved_at',
])]
class Shift extends Model
{
    protected function casts(): array
    {
        return [
            'shift_date' => 'date',
            'assigned_staff' => 'array',
            'status' => ShiftStatus::class,
            'closed_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function denominations()
    {
        return $this->hasMany(ShiftDenomination::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function cashTransfers()
    {
        return $this->hasMany(CashTransfer::class);
    }
}
