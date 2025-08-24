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
        Schema::table('test_results', function (Blueprint $table) {
            $table->unsignedBigInteger('project_id')->nullable()->after('test_script_id');
            $table->unsignedBigInteger('screen_id')->nullable()->after('project_id');
            $table->integer('execution_time')->nullable()->after('error_message');
            $table->string('screenshot_path')->nullable()->after('execution_time');
            $table->json('browser_info')->nullable()->after('screenshot_path');
            $table->json('environment_info')->nullable()->after('browser_info');

            // Add foreign key constraints
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('screen_id')->references('id')->on('screens')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('test_results', function (Blueprint $table) {
            // Drop foreign key constraints first
            $table->dropForeign(['project_id']);
            $table->dropForeign(['screen_id']);

            // Drop columns
            $table->dropColumn([
                'project_id',
                'screen_id',
                'execution_time',
                'screenshot_path',
                'browser_info',
                'environment_info',
            ]);
        });
    }
};
