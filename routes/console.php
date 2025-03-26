<?php

use App\Models\ImportSetting;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

$settings = ImportSetting::first();

if ($settings) {
    $frequency = $settings->excel_import_frequency;
    $day = $settings->excel_import_day;
    $time = $settings->excel_import_time;

    if ($frequency == 'weekly') {
        Schedule::command('import:excel')->weeklyOn((int) $day, $time)->withoutOverlapping();
    } else if ($frequency == 'daily') {
        Schedule::command('import:excel')->dailyAt($time)->withoutOverlapping();
    } else if ($frequency == 'monthly') {
        Schedule::command('import:excel')->monthlyOn((int) $day, $time)->withoutOverlapping();
    }
}
