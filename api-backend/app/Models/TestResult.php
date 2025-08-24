<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TestResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_script_id',
        'project_id',
        'screen_id',
        'status',
        'started_at',
        'completed_at',
        'execution_time',
        'error_message',
        'console_logs',
        'screenshots',
        'current_url',
        'step_data'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'execution_time' => 'integer',
        'console_logs' => 'array',
        'screenshots' => 'array',
        'step_data' => 'array'
    ];

    /**
     * Get the test script that generated this result
     */
    public function testScript(): BelongsTo
    {
        return $this->belongsTo(TestScript::class);
    }

    /**
     * Get the project that owns this test result
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the screen that owns this test result
     */
    public function screen(): BelongsTo
    {
        return $this->belongsTo(Screen::class);
    }

    /**
     * Check if the test is currently running
     */
    public function isRunning(): bool
    {
        return $this->status === 'running';
    }

    /**
     * Check if the test completed successfully
     */
    public function isSuccessful(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if the test failed
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Calculate execution time
     */
    public function calculateExecutionTime(): void
    {
        if ($this->started_at && $this->completed_at) {
            $this->execution_time = $this->started_at->diffInSeconds($this->completed_at);
        }
    }
}