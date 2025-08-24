<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TestResult;
use App\Models\TestScript;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TestResultController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'test_script_id' => 'required|exists:test_scripts,id',
            'console_output' => 'nullable|string',
            'screenshot' => 'nullable|image|max:10240', // 10MB max
            'status' => 'required|in:pending,running,completed,failed',
        ]);

        $project = $request->attributes->get('project');
        $testScript = TestScript::findOrFail($request->test_script_id);

        // Verify the test script belongs to the authenticated project
        if ($testScript->project_id !== $project->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $screenshotPath = null;
        if ($request->hasFile('screenshot')) {
            $screenshotPath = $request->file('screenshot')->store('test-screenshots', 'public');
        }

        $testResult = TestResult::create([
            'test_script_id' => $request->test_script_id,
            'console_output' => $request->console_output,
            'screenshot_path' => $screenshotPath,
            'status' => $request->status,
            'executed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Test result created successfully',
            'data' => $testResult
        ], 201);
    }

    public function index(Request $request)
    {
        $project = $request->attributes->get('project');
        $testScriptId = $request->query('test_script_id');

        $query = TestResult::whereHas('testScript', function ($q) use ($project) {
            $q->where('project_id', $project->id);
        });

        if ($testScriptId) {
            $query->where('test_script_id', $testScriptId);
        }

        $testResults = $query->with('testScript.screen')->paginate(20);

        return response()->json($testResults);
    }

    public function show(Request $request, $id)
    {
        $project = $request->attributes->get('project');
        
        $testResult = TestResult::whereHas('testScript', function ($q) use ($project) {
            $q->where('project_id', $project->id);
        })->with('testScript.screen')->findOrFail($id);

        return response()->json($testResult);
    }
}
