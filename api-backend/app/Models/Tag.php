<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'project_id',
        'color',
        'description'
    ];

    /**
     * Get the project that owns this tag
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the test scripts that have this tag
     */
    public function testScripts()
    {
        return $this->belongsToMany(TestScript::class, 'test_script_tags');
    }

    /**
     * Check if tag name is unique within the project
     */
    public static function isNameUniqueInProject(string $name, int $projectId, ?int $excludeId = null): bool
    {
        $query = static::where('name', $name)->where('project_id', $projectId);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return !$query->exists();
    }
}