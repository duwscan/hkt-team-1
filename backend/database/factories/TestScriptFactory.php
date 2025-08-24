<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TestScript>
 */
class TestScriptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'version' => fake()->randomElement(['1.0.0', '1.1.0', '2.0.0', '1.0.1']),
            'project_id' => null,
            'screen_id' => null,
        ];
    }
}
