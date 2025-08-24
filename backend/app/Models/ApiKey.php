<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    /** @use HasFactory<\Database\Factories\ApiKeyFactory> */
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'is_active',
        'last_used_at',
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
        return 'ak_' . Str::random(32);
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
}
