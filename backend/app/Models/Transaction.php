<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'customer_id', 'date', 'transaction_type', 'amount'])]
class Transaction extends Model
{
    public function user(){
        return $this->belongsTo(User::class);
    }

    public function customer(){
        return $this->belongsTo(Customer::class);
    }

    public function accountingJournals(){
        return $this->hasMany(AccountingJournal::class);
    }
}
