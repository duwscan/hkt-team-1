<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TestResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'console_output',
        'screenshot_path',
        'status',
        'executed_at',
        'test_script_id',
    ];

    protected $casts = [
        'executed_at' => 'datetime',
    ];

    public function testScript(): BelongsTo
    {
        return $this->belongsTo(TestScript::class);
    }
}
