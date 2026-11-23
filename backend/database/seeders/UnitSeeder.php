<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            [
                'name' => 'Pimpinan',
                'type' => 'PIMPINAN',
                'parent_id' => null,
            ],
            [
                'name' => 'Kepaniteraan',
                'type' => 'KEPANITERAAN',
                'parent_id' => null,
            ],
            [
                'name' => 'Kesekretariatan',
                'type' => 'KESEKRETARIATAN',
                'parent_id' => null,
            ],
        ];

        foreach ($units as $unit) {
            Unit::updateOrCreate(
                ['name' => $unit['name']],
                [
                    'type' => $unit['type'],
                    'parent_id' => $unit['parent_id'],
                    'is_active' => true,
                ]
            );
        }
    }
}