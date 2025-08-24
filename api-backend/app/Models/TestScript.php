<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TestScript extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'project_id',
        'screen_id',
        'script_file',
        'script_content',
        'version',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    /**
     * Get the project that owns this test script
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the screen that owns this test script
     */
    public function screen(): BelongsTo
    {
        return $this->belongsTo(Screen::class);
    }

    /**
     * Get the tags for this test script
     */
    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }

    /**
     * Get the test results for this test script
     */
    public function testResults(): HasMany
    {
        return $this->hasMany(TestResult::class);
    }

    /**
     * Auto-increment version if not provided
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($testScript) {
            if (empty($testScript->version)) {
                $latestVersion = static::where('project_id', $testScript->project_id)
                    ->where('name', $testScript->name)
                    ->max('version') ?? 0;
                $testScript->version = $latestVersion + 1;
            }
        });
    }
}