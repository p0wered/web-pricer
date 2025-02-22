<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ChangePassword extends Command
{
    protected $signature = 'password:change {password? : The new password}';
    protected $description = 'Change the dashboard access password';

    public function handle()
    {
        $password = $this->argument('password');

        if (!$password) {
            $password = $this->secret('Enter new password');
            $confirmation = $this->secret('Confirm new password');

            if ($password !== $confirmation) {
                $this->error('Passwords do not match!');
                return 1;
            }
        }

        $validator = Validator::make(['password' => $password], [
            'password' => 'required|min:8'
        ]);

        if ($validator->fails()) {
            $this->error('Password must be at least 8 characters long!');
            return 1;
        }

        Password::updateOrCreate(
            ['id' => 1],
            ['password' => Hash::make($password)]
        );

        $this->info('Password has been changed successfully!');
        return 0;
    }
}
