<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('search.index');
});

Route::get('/login', function () {
    if (!auth()->check()) {
        return app(AuthenticatedSessionController::class)->create();
    }
    return redirect()->route('search.index');
})->name('login');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/search', [SearchController::class, 'index'])->name('search.index');
    Route::post('/search', [SearchController::class, 'search'])->name('search.search');
    Route::get('/search-results', [SearchController::class, 'search'])->name('search.results');
});

require __DIR__.'/auth.php';
