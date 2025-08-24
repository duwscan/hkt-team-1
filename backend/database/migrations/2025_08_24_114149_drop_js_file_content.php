<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('test_scripts', function (Blueprint $table) {
            $table->dropColumn('js_file_content');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('test_scripts', function (Blueprint $table) {
            $table->text('js_file_content')->nullable();
        });
    }
};
