<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\Project;
use App\Models\Screen;
use App\Models\TestResult;
use App\Models\TestScript;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TestResultApiTest extends TestCase
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
        $this->testScript = TestScript::factory()->create([
            'project_id' => $this->project->id,
            'screen_id' => $this->screen->id,
        ]);
    }

    public function test_save_test_result_api_creates_new_result(): void
    {
        $testData = [
            'test_script_id' => $this->testScript->id,
            'status' => 'passed',
            'execution_data' => [
                'steps' => ['Step 1', 'Step 2'],
                'assertions' => ['Element found', 'Text matches'],
            ],
            'execution_time' => 1500,
            'browser_info' => [
                'browser' => 'Chrome',
                'version' => '120.0.0.0',
            ],
            'environment_info' => [
                'os' => 'macOS',
                'node_version' => '18.0.0',
            ],
        ];

        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->post('/api/test-results/save', $testData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'test_script_id',
                    'project_id',
                    'screen_id',
                    'status',
                    'execution_data',
                    'execution_time',
                    'browser_info',
                    'environment_info',
                    'started_at',
                    'completed_at',
                    'test_script' => [
                        'id',
                        'name',
                        'project' => ['id', 'name'],
                    ],
                ],
                'message',
            ])
            ->assertJson([
                'data' => [
                    'test_script_id' => $this->testScript->id,
                    'project_id' => $this->project->id,
                    'screen_id' => $this->screen->id,
                    'status' => 'passed',
                    'execution_time' => 1500,
                ],
                'message' => 'Test result saved successfully',
            ]);

        // Verify data was saved to database
        $this->assertDatabaseHas('test_results', [
            'test_script_id' => $this->testScript->id,
            'status' => 'passed',
            'execution_time' => 1500,
        ]);
    }

    public function test_save_test_result_api_requires_authentication(): void
    {
        $testData = [
            'test_script_id' => $this->testScript->id,
            'status' => 'passed',
        ];

        $response = $this->post('/api/test-results/save', $testData);

        $response->assertStatus(401);
    }

    public function test_save_test_result_api_validates_required_fields(): void
    {
        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->post('/api/test-results/save', []);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'error',
                'message',
                'details' => [
                    'test_script_id',
                    'status',
                ],
            ]);
    }

    public function test_save_test_result_api_validates_status_values(): void
    {
        $testData = [
            'test_script_id' => $this->testScript->id,
            'status' => 'invalid_status',
        ];

        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->post('/api/test-results/save', $testData);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'error',
                'message',
                'details' => [
                    'status',
                ],
            ]);
    }

    public function test_update_test_result_status_api_updates_status(): void
    {
        $testResult = TestResult::factory()->create([
            'test_script_id' => $this->testScript->id,
            'project_id' => $this->project->id,
            'screen_id' => $this->screen->id,
            'status' => 'running',
        ]);

        $updateData = [
            'status' => 'failed',
            'error_message' => 'Element not found',
            'execution_time' => 2000,
        ];

        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->put("/api/test-results/{$testResult->id}/status", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $testResult->id,
                    'status' => 'failed',
                    'error_message' => 'Element not found',
                    'execution_time' => 2000,
                ],
                'message' => 'Test result status updated successfully',
            ]);

        // Verify data was updated in database
        $this->assertDatabaseHas('test_results', [
            'id' => $testResult->id,
            'status' => 'failed',
            'error_message' => 'Element not found',
            'execution_time' => 2000,
        ]);
    }

    public function test_update_test_result_status_api_requires_authentication(): void
    {
        $testResult = TestResult::factory()->create([
            'test_script_id' => $this->testScript->id,
        ]);

        $updateData = [
            'status' => 'passed',
        ];

        $response = $this->put("/api/test-results/{$testResult->id}/status", $updateData);

        $response->assertStatus(401);
    }

    public function test_get_test_results_by_test_script_api_returns_results(): void
    {
        // Create multiple test results for the same test script
        TestResult::factory()->count(3)->create([
            'test_script_id' => $this->testScript->id,
            'project_id' => $this->project->id,
            'screen_id' => $this->screen->id,
        ]);

        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->get("/api/test-results/test-script/{$this->testScript->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'test_script_id',
                        'status',
                        'created_at',
                        'test_script' => [
                            'id',
                            'name',
                            'project' => ['id', 'name'],
                        ],
                    ],
                ],
                'message',
            ]);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_get_test_results_by_test_script_api_requires_authentication(): void
    {
        $response = $this->get("/api/test-results/test-script/{$this->testScript->id}");

        $response->assertStatus(401);
    }
}
