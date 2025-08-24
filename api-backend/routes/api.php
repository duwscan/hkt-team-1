<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ScreenController;
use App\Http\Controllers\Api\TestScriptController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\TestResultController;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('api.key')->group(function () {
    // Projects
    Route::apiResource('projects', ProjectController::class);
    
    // Screens
    Route::apiResource('screens', ScreenController::class);
    
    // Test Scripts
    Route::apiResource('test-scripts', TestScriptController::class);
    Route::get('test-scripts/search', [TestScriptController::class, 'search']);
    
    // Tags
    Route::apiResource('tags', TagController::class);
    
    // Test Results
    Route::apiResource('test-results', TestResultController::class);
    Route::get('test-results/search', [TestResultController::class, 'search']);
    
    // Run Test Script
    Route::post('test-scripts/{testScript}/run', [TestScriptController::class, 'run']);
    
    // Get API Key Info
    Route::get('auth/api-key', [AuthController::class, 'getApiKeyInfo']);
});

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'healthy']);
});