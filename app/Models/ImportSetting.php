<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImportSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'excel_import_url',
        'excel_import_username',
        'excel_import_password',
        'excel_import_frequency',
        'excel_import_day',
        'excel_import_time',
    ];
}
