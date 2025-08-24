<?php

use App\Http\Controllers\Api\ApiKeyController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ScreenController;
use App\Http\Controllers\Api\TestScriptController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\TestResultController;
use Illuminate\Support\Facades\Route;

// Public routes for API key management
Route::post('/api-keys', [ApiKeyController::class, 'store']);
Route::get('/api-keys/{key}', [ApiKeyController::class, 'show']);

// Protected routes requiring API key authentication
Route::middleware('api.key')->group(function () {
    // Projects
    Route::apiResource('projects', ProjectController::class);
    
    // Screens
    Route::apiResource('screens', ScreenController::class);
    Route::get('projects/{project}/screens', [ScreenController::class, 'getByProject']);
    
    // Tags
    Route::apiResource('tags', TagController::class);
    Route::get('projects/{project}/tags', [TagController::class, 'getByProject']);
    
    // Test Scripts
    Route::apiResource('test-scripts', TestScriptController::class);
    Route::get('test-scripts/search', [TestScriptController::class, 'search']);
    
    // Test Results
    Route::apiResource('test-results', TestResultController::class)->only(['index', 'show', 'store', 'destroy']);
    Route::get('test-results/search', [TestResultController::class, 'search']);
    
    // API Key management (protected routes)
    Route::get('/api-keys', [ApiKeyController::class, 'index']);
    Route::put('/api-keys/{apiKey}', [ApiKeyController::class, 'update']);
    Route::delete('/api-keys/{apiKey}', [ApiKeyController::class, 'destroy']);
});
