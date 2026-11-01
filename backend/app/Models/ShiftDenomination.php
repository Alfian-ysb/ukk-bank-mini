<?php

namespace App\Models;

use App\Enums\DenominationType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['shift_id', 'type', 'denomination', 'quantity', 'amount'])]
class ShiftDenomination extends Model
{
    protected function casts(): array
    {
        return ['type' => DenominationType::class];
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }
}
