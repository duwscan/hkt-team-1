<?php

namespace App\Filament\Auth;

use App\Models\ApiKey;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Pages\Auth\Login as BaseLogin;
use Illuminate\Validation\ValidationException;

class ApiKeyAuthentication extends BaseLogin
{
    public function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('api_key')
                    ->label('API Key')
                    ->required()
                    ->placeholder('Enter your API key')
                    ->autocomplete('off')
                    ->password(),
            ]);
    }

    public function authenticate(): ?\Filament\Http\Responses\Auth\Contracts\LoginResponse
    {
        $data = $this->form->getState();

        \Log::info('Authentication attempt with API key', ['api_key' => substr($data['api_key'], 0, 10).'...']);

        $apiKey = ApiKey::where('key', $data['api_key'])
            ->where('is_active', true)
            ->first();

        if (! $apiKey) {
            \Log::warning('Invalid or inactive API key attempted', ['api_key' => substr($data['api_key'], 0, 10).'...']);
            throw ValidationException::withMessages([
                'api_key' => 'Invalid or inactive API key.',
            ]);
        }

        \Log::info('API key found', ['api_key_id' => $apiKey->id, 'name' => $apiKey->name]);

        // Mark the API key as used
        $apiKey->markAsUsed();

        // Store API key in session for future use
        session(['api_key_id' => $apiKey->id]);
        session(['api_key' => $data['api_key']]);

        \Log::info('Attempting to login with API key', ['api_key_id' => $apiKey->id]);

        // Authenticate using the ApiKey model directly with the api_key guard
        auth()->guard('api_key')->login($apiKey);

        \Log::info('Login successful', ['user_id' => auth()->guard('api_key')->id(), 'guard' => 'api_key']);

        // Redirect to dashboard
        return app(\Filament\Http\Responses\Auth\Contracts\LoginResponse::class);
    }

    protected function getCredentialsFromFormData(array $data): array
    {
        return [
            'api_key' => $data['api_key'],
        ];
    }
}
