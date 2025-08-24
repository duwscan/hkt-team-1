<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FilamentApiKeyAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-API-Key') ?? $request->input('api_key');

        if (! $apiKey) {
            return response()->json(['error' => 'API key required'], 401);
        }

        $apiKeyModel = ApiKey::where('key', $apiKey)->first();

        if (! $apiKeyModel) {
            return response()->json(['error' => 'Invalid API key'], 401);
        }

        // Store API key in session for Filament to use
        session(['api_key_id' => $apiKeyModel->id]);
        session(['api_key' => $apiKey]);

        return $next($request);
    }
}
