<?php

namespace Database\Seeders;

use App\Models\Major;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MajorSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
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

        foreach ($majors as $major) {
            Major::updateOrCreate(
                ['unique_code' => $major['unique_code']],
                ['major_name' => $major['major_name']]
            );
        }
    }
}
