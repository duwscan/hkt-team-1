<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TestResultController;

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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Test Results API routes with API key authentication
Route::middleware('api.key')->group(function () {
    Route::get('/test-results', [TestResultController::class, 'index']);
    Route::post('/test-results', [TestResultController::class, 'store']);
    Route::get('/test-results/{id}', [TestResultController::class, 'show']);
});
