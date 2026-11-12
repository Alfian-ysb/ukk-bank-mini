<?php

namespace Database\Seeders;

use App\Enums\UserRoles;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $users = [
            [
                'username' => 'admin',
                'full_name' => 'Administrator',
                'password' => 'adminpass12',
                'role' => UserRoles::ADMIN->value,
            ],
            [
                'username' => 'supervisor',
                'full_name' => 'Supervisor',
                'password' => 'supervisorpass12',
                'role' => UserRoles::SUPERVISOR->value,
            ],
            [
                'username' => 'teller',
                'full_name' => 'Teller',
                'password' => 'tellerpass12',
                'role' => UserRoles::TELLER->value,
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['username' => $user['username']],
                [
                    'full_name' => $user['full_name'],
                    'password' => Hash::make($user['password']),
                    'role' => $user['role'],
                ]
            );
        }
    }
}
