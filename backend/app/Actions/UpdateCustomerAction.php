<?php

namespace App\Actions;

class UpdateCustomerAction
{
    /**
     * Create a new class instance.
     */
    public function execute($customer, array $data)
    {
        $customer->update($data);
    }
}
