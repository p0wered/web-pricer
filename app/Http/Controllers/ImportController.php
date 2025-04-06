<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class ImportController extends Controller
{
    public function import(Request $request)
    {
        try {
            Artisan::call('import:excel');
            return response()->json(['message' => 'Импорт завершен успешно']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
