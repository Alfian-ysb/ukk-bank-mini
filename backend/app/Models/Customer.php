<?php

namespace App\Models;

use Illuminate\Console\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable('user_id', 'account_number', 'nis', 'student_name', 'major', 'cohort_year', 'pin', 'password', 'status', 'fcm_token', 'balance')]
#[Hidden(['pin', 'password'])]
class Customer extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'pin'      => 'hashed',
        ];
    }

    public function getAuthIdentifierName()
    {
        return 'id';
    }

    public function changePinRequests()
    {
        return $this->hasMany(changePinRequest::class);
    }
    
}   
