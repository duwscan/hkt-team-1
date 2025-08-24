<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTestScriptRequest;
use App\Http\Requests\UpdateTestScriptRequest;
use App\Models\TestScript;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TestScriptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $testScripts = TestScript::with(['project', 'screen', 'tags'])->get();

        return response()->json([
            'data' => $testScripts,
            'message' => 'Test scripts retrieved successfully',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTestScriptRequest $request): JsonResponse
    {
        $testScript = TestScript::create($request->validated());

        if ($request->has('tag_ids')) {
            $testScript->tags()->attach($request->tag_ids);
        }

        return response()->json([
            'data' => $testScript->load(['project', 'screen', 'tags']),
            'message' => 'Test script created successfully',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(TestScript $testScript): JsonResponse
    {
        return response()->json([
            'data' => $testScript->load(['project', 'screen', 'tags']),
            'message' => 'Test script retrieved successfully',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTestScriptRequest $request, TestScript $testScript): JsonResponse
    {
        $testScript->update($request->validated());

        if ($request->has('tag_ids')) {
            $testScript->tags()->sync($request->tag_ids);
        }

        return response()->json([
            'data' => $testScript->load(['project', 'screen', 'tags']),
            'message' => 'Test script updated successfully',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TestScript $testScript): JsonResponse
    {
        $testScript->delete();

        return response()->json([
            'message' => 'Test script deleted successfully',
        ]);
    }

    /**
     * Search test scripts.
     */
    public function search(Request $request): JsonResponse
    {
        $query = TestScript::with(['project', 'screen', 'tags']);

        // Priority 1: Screen ID filtering (most specific)
        if ($request->has('screen_id') && $request->screen_id) {
            $query->where('screen_id', $request->screen_id);
        }

        // Priority 2: Project ID filtering (broader scope)
        if ($request->has('project_id') && $request->project_id) {
            $query->where('project_id', $request->project_id);
        }

        // Priority 3: Text search
        if ($request->has('q') && $request->q) {
            $searchTerm = $request->q;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhere('js_file_content', 'like', "%{$searchTerm}%");
            });
        }

        // Add ordering for consistent results
        $query->orderBy('name', 'asc');

        $testScripts = $query->get();

        return response()->json([
            'data' => $testScripts,
            'message' => 'Test scripts search completed',
            'filters_applied' => [
                'screen_id' => $request->screen_id ?? null,
                'project_id' => $request->project_id ?? null,
                'search_term' => $request->q ?? null,
                'total_results' => $testScripts->count()
            ]
        ]);
    }

    /**
     * Get the JavaScript file content of a test script.
     */
    public function getContent(TestScript $testScript)
    {
        try {
            // Check if test script has a JavaScript file
            if (! $testScript->js_file_path) {
                return response()->json([
                    'error' => 'No JavaScript file found for this test script',
                    'message' => 'Test script does not have an uploaded JavaScript file',
                ], 404);
            }

            // Check if file exists using Storage facade
            if (! Storage::disk('public')->exists($testScript->js_file_path)) {
                return response()->json([
                    'error' => 'JavaScript file not found on server',
                    'message' => 'The uploaded file does not exist on the server',
                ], 404);
            }

            // Read file content using Storage facade
            $fileContent = Storage::disk('public')->get($testScript->js_file_path);

            if ($fileContent === false) {
                return response()->json([
                    'error' => 'Failed to read file content',
                    'message' => 'Unable to read the JavaScript file content',
                ], 500);
            }

            // Return only the content
            return response($fileContent, 200, [
                'Content-Type' => 'application/javascript',
                'Content-Disposition' => 'inline; filename="'.$testScript->js_file_name.'"',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Internal server error',
                'message' => 'Failed to retrieve JavaScript file content',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Download the JavaScript file of a test script.
     */
    public function download(TestScript $testScript): JsonResponse
    {
        try {
            // Check if test script has a JavaScript file
            if (! $testScript->js_file_path) {
                return response()->json([
                    'error' => 'No JavaScript file found for this test script',
                    'message' => 'Test script does not have an uploaded JavaScript file',
                ], 404);
            }

            // Check if file exists using Storage facade
            if (! Storage::disk('public')->exists($testScript->js_file_path)) {
                return response()->json([
                    'error' => 'JavaScript file not found on server',
                    'message' => 'The uploaded file does not exist on the server',
                ], 404);
            }

            // Return only essential info for download
            return response()->json([
                'data' => [
                    'file_name' => $testScript->js_file_name,
                    'download_url' => $testScript->js_file_url,
                    'content_type' => 'application/javascript',
                ],
                'message' => 'JavaScript file download info retrieved successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Internal server error',
                'message' => 'Failed to retrieve JavaScript file download info',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
