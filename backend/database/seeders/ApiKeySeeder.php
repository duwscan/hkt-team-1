<?php

namespace Database\Seeders;

use App\Models\ApiKey;
use Illuminate\Database\Seeder;

class ApiKeySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a default API key for testing
        ApiKey::create([
            'name' => 'Default API Key',
            'key' => 'ak_test_key_for_development',
            'is_active' => true,
        ]);

        // Generate a random API key
        ApiKey::create([
            'name' => 'Generated API Key',
            'is_active' => true,
        ]);
    }
}
