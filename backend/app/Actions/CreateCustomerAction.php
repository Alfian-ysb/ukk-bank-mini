<?php

namespace App\Actions;

use App\Enums\MajorCodes;
use App\Models\Customer;

class CreateCustomerAction
{
    /**
     * Create a new class instance.
     */
    private function generateAccountNumber(array $data): string
    {
        // Tahun ajaran + kode jurusan dari enum + NIS.
        $major = $data['major'];
        $majorCode = $major instanceof \BackedEnum ? $major->value : null;

        if ($majorCode === null) {
            $majorName = strtoupper((string) $major);
            foreach (MajorCodes::cases() as $majorCase) {
                if ($majorCase->name === $majorName) {
                    $majorCode = $majorCase->value;
                    break;
                }
            }
        }

        return (string) $data['cohort_year']
            .(string) $majorCode
            .(string) $data['nis'];

    }

    public function execute(array $data)
    {
        $accountNumber = $this->generateAccountNumber($data);

        $customer = Customer::create([
            'account_number' => $accountNumber,
            'nis' => $data['nis'],
            'email' => $data['email'] ?? null,
            'student_name' => $data['student_name'],
            'major' => $data['major'],
            'cohort_year' => $data['cohort_year'],
            'password' => bcrypt($data['password']),
            'status' => 'active',
            'pin' => bcrypt($data['pin']),
            // 'balance' => 0,
        ]);

        // return $customer->load('user');
        return $customer;
    }
}
