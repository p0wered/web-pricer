<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('main_products', function (Blueprint $table) {
            $table->id();
            $table->string('name')->index();
            $table->string('code')->nullable()->index();
            $table->decimal('quantity', 15, 2)->nullable();
            $table->decimal('price', 15, 2)->nullable();
            $table->text('description')->nullable();
            $table->string('sheet_name')->index();
            $table->timestamps();

            // Добавляем полнотекстовые индексы для быстрого поиска
            $table->fullText(['name', 'code', 'description']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('main_products');
    }
};
