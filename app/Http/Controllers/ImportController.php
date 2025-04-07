<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class ImportController extends Controller
{
    public function import(Request $request)
    {
        try {
            Artisan::call('import:excel');
            return back()->with('flash', ['message' => 'Импорт завершен успешно']);
        } catch (\Exception $e) {
            return back()->with('flash', ['error' => $e->getMessage()]);
        }
    }
}
