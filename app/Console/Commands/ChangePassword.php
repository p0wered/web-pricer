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
        $passwordRecord = Password::find(1);

        $currentPassword = $this->secret('Введите текущий пароль');
        if (!Hash::check($currentPassword, $passwordRecord->password)) {
            $this->error('Неверный текущий пароль!');
            return 1;
        }

        $password = $this->argument('password');

        if (!$password) {
            $password = $this->secret('Введите новый пароль');
            $confirmation = $this->secret('Подтвердите новый пароль');

            if ($password !== $confirmation) {
                $this->error('Пароли не совпадают!');
                return 1;
            }
        }

        Password::updateOrCreate(
            ['id' => 1],
            ['password' => Hash::make($password)]
        );

        $this->info('Пароль успешно обновлен');
        return 0;
    }
}

