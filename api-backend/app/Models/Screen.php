<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Screen extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'domain',
        'url_path',
        'project_id',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    /**
     * Get the project that owns this screen
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the test scripts for this screen
     */
    public function testScripts(): HasMany
    {
        return $this->hasMany(TestScript::class);
    }

    /**
     * Get the test results for this screen
     */
    public function testResults(): HasMany
    {
        return $this->hasMany(TestResult::class);
    }

    /**
     * Get the full URL for this screen
     */
    public function getFullUrlAttribute(): string
    {
        return $this->domain . $this->url_path;
    }
}