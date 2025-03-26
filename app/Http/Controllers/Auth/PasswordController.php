<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Password;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password as PasswordRule;

class PasswordController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required'],
            'password' => ['required', PasswordRule::defaults(), 'confirmed'],
        ]);

        $passwordRecord = Password::find(1);

        if (!$passwordRecord || !Hash::check($validated['current_password'], $passwordRecord->password)) {
            return back()->withErrors([
                'current_password' => 'Текущий пароль не совпадает с нашими записями.',
            ]);
        }

        $passwordRecord->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back();
    }
}
