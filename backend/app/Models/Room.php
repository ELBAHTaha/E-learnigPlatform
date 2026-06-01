<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'capacity', 'building', 'equipment', 'is_active'];

    protected function casts(): array
    {
        return [
            'equipment' => 'array',
            'is_active' => 'boolean',
            'capacity' => 'integer',
        ];
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(ClassSession::class);
    }
}
