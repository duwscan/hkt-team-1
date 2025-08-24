<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTestScriptRequest;
use App\Http\Requests\UpdateTestScriptRequest;
use App\Models\TestScript;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            'message' => 'Test scripts retrieved successfully'
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
            'message' => 'Test script created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(TestScript $testScript): JsonResponse
    {
        return response()->json([
            'data' => $testScript->load(['project', 'screen', 'tags']),
            'message' => 'Test script retrieved successfully'
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
            'message' => 'Test script updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TestScript $testScript): JsonResponse
    {
        $testScript->delete();
        
        return response()->json([
            'message' => 'Test script deleted successfully'
        ]);
    }

    /**
     * Search test scripts.
     */
    public function search(Request $request): JsonResponse
    {
        $query = TestScript::with(['project', 'screen', 'tags']);
        
        if ($request->has('q')) {
            $searchTerm = $request->q;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('js_file_content', 'like', "%{$searchTerm}%");
            });
        }
        
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        if ($request->has('screen_id')) {
            $query->where('screen_id', $request->screen_id);
        }
        
        $testScripts = $query->get();
        
        return response()->json([
            'data' => $testScripts,
            'message' => 'Test scripts search completed'
        ]);
    }
}
