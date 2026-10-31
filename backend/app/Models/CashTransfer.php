<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['shift_id', 'amount', 'from_location', 'to_location', 'transferred_by', 'reference'])]
class CashTransfer extends Model
{
    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'transferred_by');
    }
}
