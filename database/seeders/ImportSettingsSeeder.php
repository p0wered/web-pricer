<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImportSettingsSeeder extends Seeder
{
    public function run()
    {
        DB::table('import_settings')->insert([
            'excel_import_url'        => 'https://example.com/import.xlsx',
            'excel_import_username'   => 'import_user',
            'excel_import_password'   => 'import_password',
            'excel_import_frequency'  => 'weekly',
            'excel_import_day'        => 1,
            'excel_import_time'       => '09:00',
            'created_at'              => now(),
            'updated_at'              => now(),
        ]);
    }
}
