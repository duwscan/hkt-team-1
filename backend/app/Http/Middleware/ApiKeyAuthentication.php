<?php

namespace App\Http\Middleware;

use App\Models\Project;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyAuthentication
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-API-Key') ?? $request->query('api_key');

        if (!$apiKey) {
            return response()->json(['error' => 'API key is required'], 401);
        }

        $project = Project::where('api_key', $apiKey)->first();

        if (!$project) {
            return response()->json(['error' => 'Invalid API key'], 401);
        }

        // Add project to request for later use
        $request->attributes->set('project', $project);

        return $next($request);
    }
}