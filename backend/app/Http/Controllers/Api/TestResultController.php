<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTestResultRequest;
use App\Http\Requests\UpdateTestResultRequest;
use App\Models\TestResult;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            'message' => 'Test results retrieved successfully',
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
            'message' => 'Test result created successfully',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(TestResult $testResult): JsonResponse
    {
        return response()->json([
            'data' => $testResult->load('testScript.project'),
            'message' => 'Test result retrieved successfully',
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
            'message' => 'Test result updated successfully',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TestResult $testResult): JsonResponse
    {
        $testResult->delete();

        return response()->json([
            'message' => 'Test result deleted successfully',
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
            $query->where(function ($q) use ($searchTerm) {
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
            'message' => 'Test results search completed',
        ]);
    }

    /**
     * Save test execution result.
     */
    public function saveResult(Request $request): JsonResponse
    {
        try {
            // Validate required fields
            $request->validate([
                'test_script_id' => 'required|exists:test_scripts,id',
                'status' => 'required|in:pending,running,passed,failed,skipped',
                'execution_data' => 'nullable|array',
                'started_at' => 'nullable|date',
                'completed_at' => 'nullable|date',
                'error_message' => 'nullable|string|max:255',
                'execution_time' => 'nullable|numeric|min:0',
                'screenshot_path' => 'nullable|string',
                'browser_info' => 'nullable|array',
                'environment_info' => 'nullable|array',
            ]);

            // Get test script to auto-fill project_id and screen_id
            $testScript = \App\Models\TestScript::findOrFail($request->test_script_id);

            // Create test result
            $testResult = TestResult::create([
                'test_script_id' => $request->test_script_id,
                'project_id' => $testScript->project_id,
                'screen_id' => $testScript->screen_id,
                'status' => $request->status,
                'execution_data' => $request->execution_data ?? [],
                'started_at' => $request->started_at ?? now(),
                'completed_at' => $request->completed_at ?? now(),
                'error_message' => $request->error_message,
                'execution_time' => $request->execution_time,
                'screenshot_path' => $request->screenshot_path,
                'browser_info' => $request->browser_info ?? [],
                'environment_info' => $request->environment_info ?? [],
            ]);

            return response()->json([
                'data' => $testResult->load(['testScript.project', 'testScript.screen']),
                'message' => 'Test result saved successfully',
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => 'Please check your input data',
                'details' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Internal server error',
                'message' => 'Failed to save test result',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Update test result status.
     */
    public function updateStatus(Request $request, TestResult $testResult): JsonResponse
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,running,passed,failed,skipped',
                'completed_at' => 'nullable|date',
                'error_message' => 'nullable|string|max:255',
                'execution_time' => 'nullable|numeric|min:0',
            ]);

            $testResult->update([
                'status' => $request->status,
                'completed_at' => $request->completed_at ?? now(),
                'error_message' => $request->error_message,
                'execution_time' => $request->execution_time,
            ]);

            return response()->json([
                'data' => $testResult->load(['testScript.project', 'testScript.screen']),
                'message' => 'Test result status updated successfully',
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => 'Please check your input data',
                'details' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Internal server error',
                'message' => 'Failed to update test result status',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get test results by test script.
     */
    public function getByTestScript(\App\Models\TestScript $testScript): JsonResponse
    {
        $testResults = TestResult::where('test_script_id', $testScript->id)
            ->with(['testScript.project', 'testScript.screen'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $testResults,
            'message' => 'Test results retrieved successfully',
        ]);
    }

    /**
     * Upload screenshot for a test result.
     */
    public function uploadScreenshot(Request $request, TestResult $testResult): JsonResponse
    {
        try {
            $request->validate([
                'screenshot' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240', // Max 10MB
                'description' => 'nullable|string|max:255',
            ]);

            // Check if test result exists and belongs to authenticated user/project
            if (! $testResult) {
                return response()->json([
                    'error' => 'Test result not found',
                    'message' => 'The specified test result does not exist',
                ], 404);
            }

            // Store the screenshot
            $screenshotPath = $request->file('screenshot')->store('test-screenshots', 'public');

            // Update test result with screenshot path
            $testResult->update([
                'screenshot_path' => $screenshotPath,
            ]);

            // Get the full URL for the screenshot
            $screenshotUrl = asset('storage/'.$screenshotPath);

            return response()->json([
                'data' => [
                    'id' => $testResult->id,
                    'screenshot_path' => $screenshotPath,
                    'screenshot_url' => $screenshotUrl,
                    'description' => $request->description,
                    'file_size' => $request->file('screenshot')->getSize(),
                    'mime_type' => $request->file('screenshot')->getMimeType(),
                ],
                'message' => 'Screenshot uploaded successfully',
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => 'Please check your screenshot file',
                'details' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Internal server error',
                'message' => 'Failed to upload screenshot',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get screenshot for a test result.
     */
    public function getScreenshot(TestResult $testResult): JsonResponse
    {
        try {
            if (! $testResult->screenshot_path) {
                return response()->json([
                    'error' => 'No screenshot found',
                    'message' => 'This test result does not have a screenshot',
                ], 404);
            }

            // Check if file exists
            if (! Storage::disk('public')->exists($testResult->screenshot_path)) {
                return response()->json([
                    'error' => 'No screenshot found',
                    'message' => 'This test result does not have a screenshot',
                ], 404);
            }

            // Get file info
            $fileInfo = [
                'id' => $testResult->id,
                'screenshot_path' => $testResult->screenshot_path,
                'screenshot_url' => asset('storage/'.$testResult->screenshot_path),
                'file_size' => Storage::disk('public')->size($testResult->screenshot_path),
                'mime_type' => Storage::disk('public')->mimeType($testResult->screenshot_path),
                'last_modified' => Storage::disk('public')->lastModified($testResult->screenshot_path),
            ];

            return response()->json([
                'data' => $fileInfo,
                'message' => 'Screenshot information retrieved successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Internal server error',
                'message' => 'Failed to retrieve screenshot information',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Delete screenshot for a test result.
     */
    public function deleteScreenshot(TestResult $testResult): JsonResponse
    {
        try {
            if (! $testResult->screenshot_path) {
                return response()->json([
                    'error' => 'No screenshot found',
                    'message' => 'This test result does not have a screenshot',
                ], 404);
            }

            // Delete file from storage
            if (Storage::disk('public')->exists($testResult->screenshot_path)) {
                Storage::disk('public')->delete($testResult->screenshot_path);
            }

            // Update test result to remove screenshot path
            $testResult->update([
                'screenshot_path' => null,
            ]);

            return response()->json([
                'message' => 'Screenshot deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Internal server error',
                'message' => 'Failed to delete screenshot',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
