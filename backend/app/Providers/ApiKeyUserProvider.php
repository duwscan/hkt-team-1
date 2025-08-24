<?php

namespace App\Providers;

use App\Models\ApiKey;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\UserProvider as UserProviderContract;
use Illuminate\Support\ServiceProvider;

class ApiKeyUserProvider extends ServiceProvider implements UserProviderContract
{
    public function retrieveById($identifier)
    {
        $apiKey = ApiKey::find($identifier);

        if (! $apiKey) {
            return null;
        }

        return (object) [
            'id' => $apiKey->id,
            'name' => 'API User',
            'email' => 'api@example.com',
            'api_key_id' => $apiKey->id,
        ];
    }

    public function retrieveByToken($identifier, $token)
    {
        return $this->retrieveById($identifier);
    }

    public function updateRememberToken(Authenticatable $user, $token)
    {
        // Not needed for API key auth
    }

    public function retrieveByCredentials(array $credentials)
    {
        $apiKey = $credentials['api_key'] ?? null;

        if (! $apiKey) {
            return null;
        }

        $apiKeyModel = ApiKey::where('key', $apiKey)->first();

        if (! $apiKeyModel) {
            return null;
        }

        return (object) [
            'id' => $apiKeyModel->id,
            'name' => 'API User',
            'email' => 'api@example.com',
            'api_key_id' => $apiKeyModel->id,
        ];
    }

    public function validateCredentials(Authenticatable $user, array $credentials)
    {
        $apiKey = $credentials['api_key'] ?? null;

        if (! $apiKey) {
            return false;
        }

        $apiKeyModel = ApiKey::where('key', $apiKey)->first();

        return $apiKeyModel !== null;
    }

    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false): void
    {
        // Not needed for API key auth
    }

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        //
    }
}
