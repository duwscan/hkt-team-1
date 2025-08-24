<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTestResultRequest;
use App\Http\Requests\UpdateTestResultRequest;
use App\Models\TestResult;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestResultController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $testResults = TestResult::with(['testScript.project'])->get();
        
        return response()->json([
            'data' => $testResults,
            'message' => 'Test results retrieved successfully'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTestResultRequest $request): JsonResponse
    {
        $testResult = TestResult::create($request->validated());
        
        return response()->json([
            'data' => $testResult->load('testScript.project'),
            'message' => 'Test result created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(TestResult $testResult): JsonResponse
    {
        return response()->json([
            'data' => $testResult->load('testScript.project'),
            'message' => 'Test result retrieved successfully'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTestResultRequest $request, TestResult $testResult): JsonResponse
    {
        $testResult->update($request->validated());
        
        return response()->json([
            'data' => $testResult->load('testScript.project'),
            'message' => 'Test result updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TestResult $testResult): JsonResponse
    {
        $testResult->delete();
        
        return response()->json([
            'message' => 'Test result deleted successfully'
        ]);
    }

    /**
     * Search test results.
     */
    public function search(Request $request): JsonResponse
    {
        $query = TestResult::with(['testScript.project']);
        
        if ($request->has('q')) {
            $searchTerm = $request->q;
            $query->where(function($q) use ($searchTerm) {
                $q->where('status', 'like', "%{$searchTerm}%")
                  ->orWhere('error_message', 'like', "%{$searchTerm}%");
            });
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('test_script_id')) {
            $query->where('test_script_id', $request->test_script_id);
        }
        
        if ($request->has('date_from')) {
            $query->where('started_at', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->where('started_at', '<=', $request->date_to);
        }
        
        $testResults = $query->get();
        
        return response()->json([
            'data' => $testResults,
            'message' => 'Test results search completed'
        ]);
    }
}
