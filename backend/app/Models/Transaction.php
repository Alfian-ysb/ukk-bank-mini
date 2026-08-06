<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'customer_id', 'date', 'transaction_type', 'nominal'])]
class Transaction extends Model
{
    public function user(){
        return $this->belongsTo(User::class);
    }
}
