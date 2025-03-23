<?php

return [


    'name' => env('APP_NAME', 'WebPricer'),


    'env' => env('APP_ENV', 'production'),


    'debug' => (bool) env('APP_DEBUG', false),


    'url' => env('APP_URL', 'http://localhost'),


    'excel_import_frequency' => env('EXCEL_IMPORT_FREQUENCY'),

    'excel_import_day' => env('EXCEL_IMPORT_DAY'),

    'excel_import_time' => env('EXCEL_IMPORT_TIME'),

    'excel_import_url' => env('EXCEL_IMPORT_URL'),

    'excel_import_username' => env('EXCEL_IMPORT_USERNAME'),

    'excel_import_password' => env('EXCEL_IMPORT_PASSWORD'),


    'timezone' => 'Etc/GMT+3',

    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),


    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

];
