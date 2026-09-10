<?php

namespace Database\Seeders;

use App\Enums\UserRoles;
use App\Models\Major;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $users = [
            [
                'username' => 'admin',
                'full_name' => 'Administrator',
                'password' => 'password',
                'role' => UserRoles::ADMIN->value,
            ],
            [
                'username' => 'supervisor',
                'full_name' => 'Supervisor',
                'password' => 'password',
                'role' => UserRoles::SUPERVISOR->value,
            ],
            [
                'username' => 'teller',
                'full_name' => 'Teller',
                'password' => 'password',
                'role' => UserRoles::TELLER->value,
            ],
            // [
            //     'username' => 'customer',
            //     'full_name' => 'Customer',
            //     'password' => 'password',
            //     'role' => UserRoles::CUSTOMER->value,
            // ],
        ];

        $majors = [
            [
                'major_name' => 'RPL',
                'unique_code' => '01',
            ],
            [
                'major_name' => 'TKJ',
                'unique_code' => '02',
            ],
            [
                'major_name' => 'DKV',
                'unique_code' => '03',
            ],

        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['username' => $user['username']],
                [
                    'full_name' => $user['full_name'],
                    'password' => 'password',
                    'role' => $user['role'],
                ]
            );
        }

        foreach ($majors as $major) {
            Major::updateOrCreate(
                ['unique_code' => $major['unique_code']],
                [
                    'major_name' => $major['major_name'],
                ]
            );
        }
    }
}
