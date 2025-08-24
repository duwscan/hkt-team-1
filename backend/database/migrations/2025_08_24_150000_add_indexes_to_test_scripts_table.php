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
            // Add indexes for better query performance
            $table->index('screen_id', 'test_scripts_screen_id_index');
            $table->index('project_id', 'test_scripts_project_id_index');
            $table->index(['screen_id', 'project_id'], 'test_scripts_screen_project_index');
            $table->index('name', 'test_scripts_name_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('test_scripts', function (Blueprint $table) {
            // Remove indexes
            $table->dropIndex('test_scripts_screen_id_index');
            $table->dropIndex('test_scripts_project_id_index');
            $table->dropIndex('test_scripts_screen_project_index');
            $table->dropIndex('test_scripts_name_index');
        });
    }
};
