<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\Project;
use App\Models\Screen;
use App\Models\TestScript;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TestScriptContentApiTest extends TestCase
{
    use RefreshDatabase;

    private ApiKey $apiKey;

    private Project $project;

    private Screen $screen;

    private TestScript $testScript;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test data
        $this->project = Project::factory()->create();
        $this->screen = Screen::factory()->create(['project_id' => $this->project->id]);
        $this->apiKey = ApiKey::factory()->create(['is_active' => true]);

        // Create a test JavaScript file
        Storage::fake('public');

        // Create actual file content
        $jsContent = 'console.log("Hello World");';
        $jsFilePath = 'test-scripts/test-script.js';

        // Store the file content
        Storage::disk('public')->put($jsFilePath, $jsContent);

        // Verify file was created
        $this->assertTrue(Storage::disk('public')->exists($jsFilePath), 'File was not created in storage');

        $this->testScript = TestScript::factory()->create([
            'project_id' => $this->project->id,
            'screen_id' => $this->screen->id,
            'js_file_path' => $jsFilePath,
        ]);

        // Debug: Check storage disk
        $this->assertTrue(Storage::disk('public')->exists($jsFilePath), 'File not found in public disk');
        $this->assertFalse(file_exists(storage_path('app/public/'.$jsFilePath)), 'File should not exist in real storage');
    }

    public function test_get_test_script_content_api_returns_file_content(): void
    {
        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->get("/api/test-scripts/{$this->testScript->id}/content");

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/javascript')
            ->assertHeader('Content-Disposition', 'inline; filename="'.$this->testScript->js_file_name.'"')
            ->assertSee('console.log("Hello World");', false);
    }

    public function test_get_test_script_content_api_requires_authentication(): void
    {
        $response = $this->get("/api/test-scripts/{$this->testScript->id}/content");

        $response->assertStatus(401);
    }

    public function test_get_test_script_content_api_returns_404_when_no_file(): void
    {
        // Create test script without file
        $testScriptNoFile = TestScript::factory()->create([
            'project_id' => $this->project->id,
            'screen_id' => $this->screen->id,
            'js_file_path' => null,
        ]);

        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->get("/api/test-scripts/{$testScriptNoFile->id}/content");

        $response->assertStatus(404)
            ->assertJson([
                'error' => 'No JavaScript file found for this test script',
                'message' => 'Test script does not have an uploaded JavaScript file',
            ]);
    }

    public function test_get_test_script_download_info_api_returns_file_info(): void
    {
        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->get("/api/test-scripts/{$this->testScript->id}/download");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'file_name',
                    'download_url',
                    'content_type',
                ],
                'message',
            ])
            ->assertJson([
                'data' => [
                    'file_name' => $this->testScript->js_file_name,
                    'content_type' => 'application/javascript',
                ],
                'message' => 'JavaScript file download info retrieved successfully',
            ]);
    }

    public function test_get_test_script_download_info_api_requires_authentication(): void
    {
        $response = $this->get("/api/test-scripts/{$this->testScript->id}/download");

        $response->assertStatus(401);
    }

    public function test_get_test_script_download_info_api_returns_404_when_no_file(): void
    {
        // Create test script without file
        $testScriptNoFile = TestScript::factory()->create([
            'project_id' => $this->project->id,
            'screen_id' => $this->screen->id,
            'js_file_path' => null,
        ]);

        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->get("/api/test-scripts/{$testScriptNoFile->id}/download");

        $response->assertStatus(404)
            ->assertJson([
                'error' => 'No JavaScript file found for this test script',
                'message' => 'Test script does not have an uploaded JavaScript file',
            ]);
    }
}
