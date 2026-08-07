<?php

namespace App\Actions;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateCustomerAction
{
    /**
     * Create a new class instance.
     */
    public function execute(array $data)
    {
        return DB::transaction(function () use ($data) {

            $user = User::create([
                'username' => $data['username'],
                'full_name' => $data['full_name'],
                'password' => bcrypt($data['password']),
                'role' => 'customer',
            ]);
        
            $customer = Customer::create([
                'user_id' => $user->id,
                'account_number' => $data['account_number'],
                'nis' => $data['nis'],
                'student_name' => $data['student_name'],
                'class' => $data['class'],
                'status' => 'active',
                'pin' => bcrypt($data['pin']),
                // 'saldo' => 0,
            ]);

            return $customer->load('user');
        });
    }
}
