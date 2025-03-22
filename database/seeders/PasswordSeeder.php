<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Password;

class PasswordSeeder extends Seeder
{
    public function run(): void
    {
        Password::create([
            'password' => Hash::make('12341234')
        ]);
    }
}
