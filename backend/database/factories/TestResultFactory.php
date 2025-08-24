<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TestResult>
 */
class TestResultFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'status' => fake()->randomElement(['pending', 'running', 'passed', 'failed', 'skipped']),
            'execution_data' => [
                'steps' => fake()->words(3),
                'assertions' => fake()->words(2),
            ],
            'started_at' => fake()->dateTimeBetween('-1 hour', 'now'),
            'completed_at' => fake()->dateTimeBetween('now', '+1 hour'),
            'error_message' => fake()->optional()->sentence(),
            'execution_time' => fake()->optional()->numberBetween(100, 5000),
            'screenshot_path' => fake()->optional()->filePath(),
            'browser_info' => [
                'browser' => fake()->randomElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
                'version' => fake()->semver(),
            ],
            'environment_info' => [
                'os' => fake()->randomElement(['Windows', 'macOS', 'Linux']),
                'node_version' => fake()->semver(),
            ],
        ];
    }
}
