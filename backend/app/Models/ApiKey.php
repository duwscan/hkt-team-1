<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Str;

class ApiKey extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\ApiKeyFactory> */
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'is_active',
        'last_used_at',
    ];

    protected $hidden = [
        'key',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_used_at' => 'datetime',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        // Generate API key if not provided
        static::creating(function ($apiKey) {
            if (empty($apiKey->key)) {
                $apiKey->key = static::generateKey();
            }
        });
    }

    public static function generateKey(): string
    {
        return 'ak_'.Str::random(32);
    }

    public static function isValid(string $key): bool
    {
        return static::where('key', $key)
            ->where('is_active', true)
            ->exists();
    }

    public function markAsUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Get the name of the unique identifier for the user.
     */
    public function getAuthIdentifierName(): string
    {
        return 'id';
    }

    /**
     * Get the unique identifier for the user.
     */
    public function getAuthIdentifier(): mixed
    {
        return $this->getAttribute($this->getAuthIdentifierName());
    }

    /**
     * Get the password for the user.
     */
    public function getAuthPassword(): string
    {
        return $this->key;
    }

    /**
     * Get the token value for the "remember me" session.
     */
    public function getRememberToken(): ?string
    {
        return null;
    }

    /**
     * Set the token value for the "remember me" session.
     */
    public function setRememberToken($value): void
    {
        // API keys don't support remember me functionality
    }

    /**
     * Get the column name for the "remember me" token.
     */
    public function getRememberTokenName(): string
    {
        return '';
    }
}
