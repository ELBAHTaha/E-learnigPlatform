<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pole extends Model
{
    use HasFactory;

    protected $fillable = ['slug', 'label', 'tagline', 'color'];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function formations(): HasMany
    {
        return $this->hasMany(Formation::class);
    }
}
