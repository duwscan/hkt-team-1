<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\Project;
use App\Models\Screen;
use App\Models\TestResult;
use App\Models\TestScript;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TestResultScreenshotApiTest extends TestCase
{
    use RefreshDatabase;

    private ApiKey $apiKey;

    private Project $project;

    private Screen $screen;

    private TestScript $testScript;

    private TestResult $testResult;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test data
        $this->project = Project::factory()->create();
        $this->screen = Screen::factory()->create(['project_id' => $this->project->id]);
        $this->apiKey = ApiKey::factory()->create(['is_active' => true]);
        $this->testScript = TestScript::factory()->create([
            'project_id' => $this->project->id,
            'screen_id' => $this->screen->id,
        ]);
        $this->testResult = TestResult::factory()->create([
            'test_script_id' => $this->testScript->id,
            'project_id' => $this->project->id,
            'screen_id' => $this->screen->id,
        ]);
    }

    public function test_upload_screenshot_api_uploads_file_successfully(): void
    {
        Storage::fake('public');

        $screenshot = UploadedFile::fake()->image('test-screenshot.png', 800, 600);

        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->post("/api/test-results/{$this->testResult->id}/screenshot", [
            'screenshot' => $screenshot,
            'description' => 'Test failure screenshot',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'screenshot_path',
                    'screenshot_url',
                    'description',
                    'file_size',
                    'mime_type',
                ],
                'message',
            ])
            ->assertJson([
                'data' => [
                    'id' => $this->testResult->id,
                    'description' => 'Test failure screenshot',
                ],
                'message' => 'Screenshot uploaded successfully',
            ]);

        // Verify file was stored
        $this->assertTrue(Storage::disk('public')->exists($response->json('data.screenshot_path')));

        // Verify database was updated
        $this->assertDatabaseHas('test_results', [
            'id' => $this->testResult->id,
            'screenshot_path' => $response->json('data.screenshot_path'),
        ]);
    }

    public function test_upload_screenshot_api_requires_authentication(): void
    {
        Storage::fake('public');
        $screenshot = UploadedFile::fake()->image('test-screenshot.png');

        $response = $this->post("/api/test-results/{$this->testResult->id}/screenshot", [
            'screenshot' => $screenshot,
        ]);

        $response->assertStatus(401);
    }

    public function test_upload_screenshot_api_validates_file_type(): void
    {
        Storage::fake('public');
        $invalidFile = UploadedFile::fake()->create('test.txt', 100, 'text/plain');

        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->post("/api/test-results/{$this->testResult->id}/screenshot", [
            'screenshot' => $invalidFile,
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'error',
                'message',
                'details' => [
                    'screenshot',
                ],
            ]);
    }

    public function test_upload_screenshot_api_validates_file_size(): void
    {
        Storage::fake('public');
        $largeFile = UploadedFile::fake()->image('large-screenshot.png')->size(15000); // 15MB

        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->post("/api/test-results/{$this->testResult->id}/screenshot", [
            'screenshot' => $largeFile,
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'error',
                'message',
                'details' => [
                    'screenshot',
                ],
            ]);
    }

    public function test_get_screenshot_api_returns_screenshot_info(): void
    {
        // First upload a screenshot
        Storage::fake('public');
        $screenshot = UploadedFile::fake()->image('test-screenshot.png');

        $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->post("/api/test-results/{$this->testResult->id}/screenshot", [
            'screenshot' => $screenshot,
        ]);

        // Now get screenshot info
        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->get("/api/test-results/{$this->testResult->id}/screenshot");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'screenshot_path',
                    'screenshot_url',
                    'file_size',
                    'mime_type',
                    'last_modified',
                ],
                'message',
            ])
            ->assertJson([
                'data' => [
                    'id' => $this->testResult->id,
                ],
                'message' => 'Screenshot information retrieved successfully',
            ]);
    }

    public function test_get_screenshot_api_returns_404_when_no_screenshot(): void
    {
        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->get("/api/test-results/{$this->testResult->id}/screenshot");

        $response->assertStatus(404)
            ->assertJson([
                'error' => 'No screenshot found',
                'message' => 'This test result does not have a screenshot',
            ]);
    }

    public function test_get_screenshot_api_requires_authentication(): void
    {
        $response = $this->get("/api/test-results/{$this->testResult->id}/screenshot");

        $response->assertStatus(401);
    }

    public function test_delete_screenshot_api_deletes_file_successfully(): void
    {
        // First upload a screenshot
        Storage::fake('public');
        $screenshot = UploadedFile::fake()->image('test-screenshot.png');

        $uploadResponse = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->post("/api/test-results/{$this->testResult->id}/screenshot", [
            'screenshot' => $screenshot,
        ]);

        $screenshotPath = $uploadResponse->json('data.screenshot_path');

        // Now delete the screenshot
        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->delete("/api/test-results/{$this->testResult->id}/screenshot");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Screenshot deleted successfully',
            ]);

        // Verify file was deleted from storage
        $this->assertFalse(Storage::disk('public')->exists($screenshotPath));

        // Verify database was updated
        $this->assertDatabaseHas('test_results', [
            'id' => $this->testResult->id,
            'screenshot_path' => null,
        ]);
    }

    public function test_delete_screenshot_api_returns_404_when_no_screenshot(): void
    {
        // Create a test result without screenshot
        $testResultNoScreenshot = TestResult::factory()->create([
            'test_script_id' => $this->testScript->id,
            'project_id' => $this->project->id,
            'screen_id' => $this->screen->id,
            'screenshot_path' => null,
        ]);

        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->delete("/api/test-results/{$testResultNoScreenshot->id}/screenshot");

        $response->assertStatus(404)
            ->assertJson([
                'error' => 'No screenshot found',
                'message' => 'This test result does not have a screenshot',
            ]);
    }

    public function test_delete_screenshot_api_requires_authentication(): void
    {
        $response = $this->delete("/api/test-results/{$this->testResult->id}/screenshot");

        $response->assertStatus(401);
    }

    public function test_upload_screenshot_api_handles_multiple_formats(): void
    {
        Storage::fake('public');

        $formats = [
            'jpeg' => UploadedFile::fake()->image('test.jpeg', 800, 600),
            'png' => UploadedFile::fake()->image('test.png', 800, 600),
            'jpg' => UploadedFile::fake()->image('test.jpg', 800, 600),
            'gif' => UploadedFile::fake()->image('test.gif', 800, 600),
        ];

        foreach ($formats as $format => $file) {
            $response = $this->withHeaders([
                'X-API-Key' => $this->apiKey->key,
            ])->post("/api/test-results/{$this->testResult->id}/screenshot", [
                'screenshot' => $file,
            ]);

            $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Screenshot uploaded successfully',
                ]);

            // Verify file was stored
            $this->assertTrue(Storage::disk('public')->exists($response->json('data.screenshot_path')));
        }
    }
}
