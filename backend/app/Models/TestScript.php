<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TestScript extends Model
{
    /** @use HasFactory<\Database\Factories\TestScriptFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'js_file_content',
        'js_file_path',
        'project_id',
        'screen_id',
        'version',
    ];

    protected static function boot(): void
    {
        parent::boot();

        // Auto-increment version if not provided
        static::creating(function ($testScript) {
            if (empty($testScript->version)) {
                $lastVersion = static::where('name', $testScript->name)
                    ->where('project_id', $testScript->project_id)
                    ->where('screen_id', $testScript->screen_id)
                    ->orderBy('version', 'desc')
                    ->first();

                if ($lastVersion) {
                    // Simple version increment (assumes format like "1.0.0")
                    $versionParts = explode('.', $lastVersion->version);
                    $versionParts[2] = (int) $versionParts[2] + 1;
                    $testScript->version = implode('.', $versionParts);
                } else {
                    $testScript->version = '1.0.0';
                }
            }
        });
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function screen(): BelongsTo
    {
        return $this->belongsTo(Screen::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'test_script_tag');
    }

    public function testResults(): HasMany
    {
        return $this->hasMany(TestResult::class);
    }

    public function getJsFileUrlAttribute(): ?string
    {
        if ($this->js_file_path) {
            return asset('storage/'.$this->js_file_path);
        }

        return null;
    }

    public function getJsFileNameAttribute(): ?string
    {
        if ($this->js_file_path) {
            return basename($this->js_file_path);
        }

        return null;
    }
}
