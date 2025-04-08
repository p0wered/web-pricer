<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('special_products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->nullable();
            $table->integer('quantity')->nullable();
            $table->string('price')->nullable();
            $table->text('description')->nullable();
            $table->string('sheet_name');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('special_products');
    }
};
