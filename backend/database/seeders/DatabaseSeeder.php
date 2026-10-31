<?php

namespace Database\Seeders;

use App\Enums\UserRoles;
use App\Models\Customer;
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

        $customers = [
            [
                'account_number' => '2027011501',
                'nis' => '1501',
                'student_name' => 'John Doe',
                'major' => 'DKV',
                "cohort_year" => "2027",
                'pin' => Hash::make('123456'),
                'password' => Hash::make('password'),
            ],
            [
                'account_number' => '2027011502',
                'student_name' => 'Jane Smith',
                'nis' => '1502',
                'major' => 'TKJ',
                'cohort_year' => '2027',
                'pin' => Hash::make('123456'),
                'password' => Hash::make('password'),
            ],
            [
                'account_number' => '2027011503',
                'student_name' => 'Alice Johnson',
                'nis' => '1503',
                'major' => 'RPL',
                'cohort_year' => '2027',
                'pin' => Hash::make('123456'),
                'password' => Hash::make('password'),
            ],
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

        foreach ($customers as $customer) {
            Customer::updateOrCreate(
                ['account_number' => $customer['account_number']],
                [
                    'student_name' => $customer['student_name'],
                    'nis' => $customer['nis'],
                    'major' => $customer['major'],
                    'cohort_year' => $customer['cohort_year'],
                    'pin' => $customer['pin'],
                    'password' => $customer['password'],
                ]
            );
        }
    }
}
