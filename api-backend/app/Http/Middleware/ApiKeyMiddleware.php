<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ApiKey;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-API-Key') ?? $request->query('api_key');
        
        if (!$apiKey) {
            return response()->json([
                'error' => 'API key is required',
                'message' => 'Please provide an API key in the X-API-Key header or api_key query parameter'
            ], 401);
        }
        
        $validKey = ApiKey::where('key', $apiKey)->where('is_active', true)->first();
        
        if (!$validKey) {
            return response()->json([
                'error' => 'Invalid API key',
                'message' => 'The provided API key is invalid or inactive'
            ], 401);
        }
        
        // Store the API key info in the request for controllers to use
        $request->attributes->set('api_key', $validKey);
        
        return $next($request);
    }
}