<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTagRequest;
use App\Http\Requests\UpdateTagRequest;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $tags = Tag::with(['project'])->get();
        
        return response()->json([
            'data' => $tags,
            'message' => 'Tags retrieved successfully'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTagRequest $request): JsonResponse
    {
        $tag = Tag::create($request->validated());
        
        return response()->json([
            'data' => $tag->load('project'),
            'message' => 'Tag created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tag $tag): JsonResponse
    {
        return response()->json([
            'data' => $tag->load('project'),
            'message' => 'Tag retrieved successfully'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTagRequest $request, Tag $tag): JsonResponse
    {
        $tag->update($request->validated());
        
        return response()->json([
            'data' => $tag->load('project'),
            'message' => 'Tag updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tag $tag): JsonResponse
    {
        $tag->delete();
        
        return response()->json([
            'message' => 'Tag deleted successfully'
        ]);
    }

    /**
     * Get tags by project.
     */
    public function getByProject(int $projectId): JsonResponse
    {
        $tags = Tag::where('project_id', $projectId)->with(['project'])->get();
        
        return response()->json([
            'data' => $tags,
            'message' => 'Project tags retrieved successfully'
        ]);
    }
}
