<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\SearchController;
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

Route::get('/search', [SearchController::class, 'index'])->name('search.index');
Route::post('/search', [SearchController::class, 'search'])->name('search.search');

require __DIR__.'/auth.php';
