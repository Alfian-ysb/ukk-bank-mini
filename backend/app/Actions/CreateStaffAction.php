<?php

namespace App\Actions;

use App\Models\User;

class CreateStaffAction
{
    /**
     * Create a new class instance.
     */
    public function execute(array $data): User
    {
        return User::create([
            'username' => $data['username'],
            'full_name' => $data['full_name'],
            'password' => bcrypt($data['password']),
            'role' => $data['role'],
        ]);
    }
}
