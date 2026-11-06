<?php

namespace Database\Seeders;

use App\Enums\UserRoles;
use App\Models\Customer;
use App\Models\General;
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
        $generals = [
            [
                'name' => 'bank_name',
                'value' => 'Bank Mini SMK Negeri 1',
            ],
            [
                'name' => 'bank_address',
                'value' => 'Jl. Parangtritis No.KM.11, Dukuh, Sabdodadi, Kec. Bantul, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55715',
            ],
            [
                'name' => 'minimum_balance',
                'value' => '10000',
            ],
            [
                'name' => 'bank_contact',
                'value' => '621234567890',
            ],
            [
                'name' => 'minimum_withdrawal',
                'value' => '10000',
            ]
        ];

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
                'email' => 'ayofasb@gmail.com',
                'student_name' => 'David',
                'major' => 'DKV',
                "cohort_year" => "2027",
                'pin' => Hash::make('123456'),
                'password' => Hash::make('password'),
            ],
            [
                'account_number' => '2027011502',
                'student_name' => 'Anisa',
                'email' => 'example@mail.com',
                'nis' => '1502',
                'major' => 'TKJ',
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
            $customerValues = [
                'student_name' => $customer['student_name'],
                'nis' => $customer['nis'],
                'major' => $customer['major'],
                'cohort_year' => $customer['cohort_year'],
                'pin' => $customer['pin'],
                'password' => $customer['password'],
            ];

            if (array_key_exists('email', $customer)) {
                $customerValues['email'] = $customer['email'];
            }

            Customer::updateOrCreate(
                ['account_number' => $customer['account_number']],
                $customerValues,
            );
        }

        foreach ($generals as $general) {
            General::updateOrCreate(
                ['name' => $general['name']],
                ['value' => $general['value']]
            );
        }
    }
}
