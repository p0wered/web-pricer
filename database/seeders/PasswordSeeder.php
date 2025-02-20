<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Password;

class PasswordSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        Password::create([
            'password' => bcrypt('12341234'),
        ]);
    }
}
