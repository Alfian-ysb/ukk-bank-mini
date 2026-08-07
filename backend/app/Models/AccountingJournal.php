<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['transaction_id', 'account_code', 'position', 'amount'])]
class AccountingJournal extends Model
{
    public function transaction(){
        return $this->belongsTo(Transaction::class);
    }
}
