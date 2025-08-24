<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\Project;
use App\Models\Screen;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectDetailTest extends TestCase
{
    use RefreshDatabase;

    private ApiKey $apiKey;

    protected function setUp(): void
    {
        parent::setUp();

        // Create an API key for testing
        $this->apiKey = ApiKey::factory()->create();
    }

    public function test_project_detail_api_returns_project_information(): void
    {
        $project = Project::factory()->create([
            'name' => 'Test Project',
            'description' => 'This is a test project description',
        ]);

        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->get("/api/projects/{$project->id}");

        $response->assertStatus(200);
        $response->assertJson([
            'data' => [
                'id' => $project->id,
                'name' => 'Test Project',
                'description' => 'This is a test project description',
            ],
        ]);
    }

    public function test_project_screens_api_returns_screens_list(): void
    {
        $project = Project::factory()->create();
        $screen1 = Screen::factory()->create([
            'project_id' => $project->id,
            'name' => 'Home Screen',
            'domain' => 'example.com',
            'url_path' => '/',
        ]);
        $screen2 = Screen::factory()->create([
            'project_id' => $project->id,
            'name' => 'About Screen',
            'domain' => 'example.com',
            'url_path' => '/about',
        ]);

        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->get("/api/projects/{$project->id}/screens");

        $response->assertStatus(200);
        $response->assertJson([
            'data' => [
                [
                    'id' => $screen1->id,
                    'name' => 'Home Screen',
                    'domain' => 'example.com',
                    'url_path' => '/',
                ],
                [
                    'id' => $screen2->id,
                    'name' => 'About Screen',
                    'domain' => 'example.com',
                    'url_path' => '/about',
                ],
            ],
        ]);
    }

    public function test_project_screens_api_returns_empty_array_when_no_screens(): void
    {
        $project = Project::factory()->create();

        $response = $this->withHeaders([
            'X-API-Key' => $this->apiKey->key,
        ])->get("/api/projects/{$project->id}/screens");

        $response->assertStatus(200);
        $response->assertJson([
            'data' => [],
        ]);
    }

    public function test_project_screens_api_requires_authentication(): void
    {
        $project = Project::factory()->create();

        $response = $this->get("/api/projects/{$project->id}/screens");

        $response->assertStatus(401);
    }
}
