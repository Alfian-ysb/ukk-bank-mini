<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable('user_id', 'account_number', 'nis', 'student_name', 'class', 'status', 'pin', 'saldo')]
class Customer extends Model
{
    public function user(){
        return $this->belongsTo(User::class);
    }
}
