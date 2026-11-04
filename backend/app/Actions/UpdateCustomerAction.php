<?php

namespace App\Actions;

use Illuminate\Support\Facades\Hash;

class UpdateCustomerAction
{
    /**
     * Create a new class instance.
     */
    public function execute($customer, array $data)
    {
        // Hash PIN jika ada di dalam input
        if (isset($data['pin'])) {
            $data['pin'] = Hash::make($data['pin']);
        }

        // Hash Password jika ada di dalam input
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $customer->update($data);
        return $customer;
    }
}
