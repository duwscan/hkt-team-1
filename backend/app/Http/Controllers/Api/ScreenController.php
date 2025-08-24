<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreScreenRequest;
use App\Http\Requests\UpdateScreenRequest;
use App\Models\Screen;
use Illuminate\Http\JsonResponse;

class ScreenController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $screens = Screen::with(['project'])->get();

        return response()->json([
            'data' => $screens,
            'message' => 'Screens retrieved successfully'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreScreenRequest $request): JsonResponse
    {
        $screen = Screen::create($request->validated());

        return response()->json([
            'data' => $screen->load('project'),
            'message' => 'Screen created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Screen $screen): JsonResponse
    {
        return response()->json([
            'data' => $screen->load('project'),
            'message' => 'Screen retrieved successfully'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateScreenRequest $request, Screen $screen): JsonResponse
    {
        $screen->update($request->validated());

        return response()->json([
            'data' => $screen->load('project'),
            'message' => 'Screen updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Screen $screen): JsonResponse
    {
        $screen->delete();

        return response()->json([
            'message' => 'Screen deleted successfully'
        ]);
    }

    /**
     * Get screens by project.
     */
    public function getByProject(int $projectId): JsonResponse
    {
        $screens = Screen::where('project_id', $projectId)->with(['project'])->get();

        return response()->json([
            'data' => $screens,
            'message' => 'Project screens retrieved successfully'
        ]);
    }
}
