<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'author_id', 'author_name', 'title', 'body',
        'target_roles', 'is_published', 'pinned', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'target_roles' => 'array',
            'is_published' => 'boolean',
            'pinned' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /** Whether this announcement targets the given role (empty target = everyone). */
    public function isVisibleTo(?string $role): bool
    {
        $targets = $this->target_roles;
        if (empty($targets)) {
            return true; // "tous"
        }

        return $role !== null && in_array($role, $targets, true);
    }
}
