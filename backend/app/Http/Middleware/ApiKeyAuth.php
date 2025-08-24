<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-API-Key') ?? $request->get('api_key');

        if (!$apiKey) {
            return response()->json(['error' => 'API key is required'], 401);
        }

        if (!ApiKey::isValid($apiKey)) {
            return response()->json(['error' => 'Invalid API key'], 401);
        }

        // Mark API key as used
        $apiKeyModel = ApiKey::where('key', $apiKey)->first();
        if ($apiKeyModel) {
            $apiKeyModel->markAsUsed();
        }

        return $next($request);
    }
}
