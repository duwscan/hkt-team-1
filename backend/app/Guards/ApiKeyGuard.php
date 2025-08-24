<?php

namespace App\Guards;

use App\Models\ApiKey;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Http\Request;

class ApiKeyGuard implements Guard
{
    protected $request;

    protected $provider;

    protected $user;

    public function __construct(UserProvider $provider, Request $request)
    {
        $this->provider = $provider;
        $this->request = $request;
    }

    public function user()
    {
        if ($this->user !== null) {
            return $this->user;
        }

        $apiKey = $this->request->header('X-API-Key') ?? $this->request->input('api_key');

        if (! $apiKey) {
            return null;
        }

        $apiKeyModel = ApiKey::where('key', $apiKey)->first();

        if (! $apiKeyModel) {
            return null;
        }

        // Create a virtual user for Filament
        $this->user = (object) [
            'id' => $apiKeyModel->id,
            'name' => 'API User',
            'email' => 'api@example.com',
            'api_key_id' => $apiKeyModel->id,
        ];

        return $this->user;
    }

    public function check()
    {
        return $this->user() !== null;
    }

    public function guest()
    {
        return ! $this->check();
    }

    public function id()
    {
        if ($user = $this->user()) {
            return $user->id;
        }
    }

    public function validate(array $credentials = [])
    {
        $apiKey = $credentials['api_key'] ?? null;

        if (! $apiKey) {
            return false;
        }

        $apiKeyModel = ApiKey::where('key', $apiKey)->first();

        return $apiKeyModel !== null;
    }

    public function hasUser()
    {
        return $this->user() !== null;
    }

    public function setUser($user)
    {
        $this->user = $user;

        return $this;
    }
}
