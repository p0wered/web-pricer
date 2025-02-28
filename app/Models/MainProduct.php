<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MainProduct extends Model
{
    protected $fillable = [
        'name',
        'code',
        'quantity',
        'price',
        'description',
        'sheet_name',
    ];
}
