<?php

namespace App\Actions;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Str;

class CreateCustomerAction
{
    /**
     * Create a new class instance.
     */
    private function generateAccountNumber(): string
    {
        $year = date('Y');
        $prefix = $year >= 7 ? $year : $year - 1;
        $lastCustomer = Customer::orderBy('id', 'desc')->first();
        $lastAccountNumber = $lastCustomer ? (int) substr($lastCustomer->account_number, 4) : 0;
        $newAccountNumber = $lastAccountNumber + 1;
        return $prefix . str_pad($newAccountNumber, 6, '0', STR_PAD_LEFT);
        
    }

    public function execute(array $data)
    {
        $accountNumber = $this->generateAccountNumber();

        $customer = Customer::create([
            'account_number' => $accountNumber,
            'nis' => $data['nis'],
            'student_name' => $data['student_name'],
            'class' => $data['class'],
            'password' => bcrypt($data['password']),
            'status' => 'active',
            'pin' => bcrypt($data['pin']),
            // 'balance' => 0,
        ]);

        // return $customer->load('user');
        return $customer;
    }
}
