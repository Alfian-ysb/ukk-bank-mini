<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $customers = [
            [
                'account_number' => '2027011501',
                'nis' => '1501',
                'email' => 'ayofasb@gmail.com',
                'student_name' => 'David',
                'major' => 'DKV',
                'cohort_year' => '2027',
                'pin' => bcrypt('123456'),
                'password' => bcrypt('password'),
            ],
            [
                'account_number' => '2027021502',
                'student_name' => 'Anisa',
                'email' => '',
                'nis' => '1502',
                'major' => 'TKJ',
                'cohort_year' => '2027',
                'pin' => bcrypt('123456'),
                'password' => bcrypt('rahasia'),
            ],
        ];

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
    }
}
