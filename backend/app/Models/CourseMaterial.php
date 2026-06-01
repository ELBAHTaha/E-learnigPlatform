<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'formation_id', 'uploader_id', 'type', 'title', 'description',
        'disk', 'file_path', 'original_filename', 'file_size',
        'external_video_url', 'order',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'order' => 'integer',
        ];
    }

    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }

    /** Corrigés are gated to enrolled students / the trainer / admins. */
    public function isRestricted(): bool
    {
        return $this->type === 'corrige' || $this->disk === 'private';
    }
}
