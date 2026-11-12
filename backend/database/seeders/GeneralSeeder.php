<?php

namespace Database\Seeders;

use App\Models\General;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GeneralSeeder extends Seeder
{
    use WithoutModelEvents;

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
            ],
            [
                'name' => 'max_withdrawal',
                'value' => '1000000',
            ],
        ];

        foreach ($generals as $general) {
            General::updateOrCreate(
                ['name' => $general['name']],
                ['value' => $general['value']]
            );
        }
    }
}
