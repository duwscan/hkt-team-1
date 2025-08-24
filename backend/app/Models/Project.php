<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    public function screens(): HasMany
    {
        return $this->hasMany(Screen::class);
    }

    public function testScripts(): HasMany
    {
        return $this->hasMany(TestScript::class);
    }

    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }
}
