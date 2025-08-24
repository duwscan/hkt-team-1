<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TestResult extends Model
{
    /** @use HasFactory<\Database\Factories\TestResultFactory> */
    use HasFactory;

    protected $fillable = [
        'test_script_id',
        'project_id',
        'screen_id',
        'status',
        'execution_data',
        'started_at',
        'completed_at',
        'error_message',
        'execution_time',
        'screenshot_path',
        'browser_info',
        'environment_info',
    ];

    protected function casts(): array
    {
        return [
            'execution_data' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'browser_info' => 'array',
            'environment_info' => 'array',
        ];
    }

    public function testScript(): BelongsTo
    {
        return $this->belongsTo(TestScript::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function screen(): BelongsTo
    {
        return $this->belongsTo(Screen::class);
    }
}
