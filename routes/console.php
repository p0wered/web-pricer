<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

$frequency = env('EXCEL_IMPORT_FREQUENCY');
$day = env('EXCEL_IMPORT_DAY');
$time  = env('EXCEL_IMPORT_TIME');

if ($frequency = 'weekly') {
    Schedule::command('import:excel')->weeklyOn($day, $time)->withoutOverlapping();
} else if ($frequency = 'daily') {
    Schedule::command('import:excel')->dailyAt($time)->withoutOverlapping();
} else if ($frequency = 'monthly') {
    Schedule::command('import:excel')->monthlyOn($day, $time)->withoutOverlapping();
}

