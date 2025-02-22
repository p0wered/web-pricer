<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/login', function () {
    if (!auth()->check()) {
        return app(AuthenticatedSessionController::class)->create();
    }
    return redirect()->route('dashboard');
})->name('login');

Route::get('/dashboard', function () {
    if (auth()->check()) {
        return Inertia::render('Dashboard');
    }
    return redirect()->route('login');
})->name('dashboard');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout');

require __DIR__.'/auth.php';
