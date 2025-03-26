<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('import_settings', function (Blueprint $table) {
            $table->id();
            $table->string('excel_import_url');
            $table->string('excel_import_username');
            $table->string('excel_import_password');
            $table->enum('excel_import_frequency', ['daily', 'weekly', 'monthly'])->default('weekly');
            $table->integer('excel_import_day')->nullable();
            $table->string('excel_import_time');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('import_settings');
    }
};
