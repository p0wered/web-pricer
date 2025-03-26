<?php

namespace App\Http\Controllers;

use App\Models\ImportSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ImportSettingsController extends Controller
{
    public function index(): Response
    {
        $settings = ImportSetting::first();
        return Inertia::render('Settings', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'excel_import_url' => 'required|url',
            'excel_import_username' => 'required|string',
            'excel_import_password' => 'required|string',
            'excel_import_frequency' => 'required|in:daily,weekly,monthly',
            'excel_import_day' => 'nullable|integer|min:1|max:31',
            'excel_import_time' => 'required|string',
        ]);

        $settings = ImportSetting::firstOrCreate([]);
        $settings->update($validated);

        return back()->with('success', 'Настройки обновлены');
    }
}
