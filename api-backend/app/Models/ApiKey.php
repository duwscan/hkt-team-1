<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'key',
        'is_active',
        'last_used_at',
        'expires_at'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime'
    ];

    protected $hidden = [
        'key'
    ];

    /**
     * Generate a new API key
     */
    public static function generateKey(): string
    {
        return 'cr_' . Str::random(32);
    }

    /**
     * Create a new API key
     */
    public static function createKey(string $name, ?string $expiresAt = null): self
    {
        return static::create([
            'name' => $name,
            'key' => static::generateKey(),
            'is_active' => true,
            'expires_at' => $expiresAt
        ]);
    }

    /**
     * Check if the API key is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Update last used timestamp
     */
    public function markAsUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }
}