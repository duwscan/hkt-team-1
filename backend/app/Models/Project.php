<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'api_key',
    ];

    protected $hidden = [
        'api_key',
    ];

    public function screens(): HasMany
    {
        return $this->hasMany(Screen::class);
    }

    public function testScripts(): HasMany
    {
        return $this->hasManyThrough(TestScript::class, Screen::class);
    }
}
