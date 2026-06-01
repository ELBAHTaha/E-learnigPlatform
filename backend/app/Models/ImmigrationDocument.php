<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImmigrationDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'dossier_id', 'name', 'is_required', 'provided', 'status',
        'disk', 'file_path', 'original_filename', 'file_size',
        'notes', 'uploaded_by', 'verified_by',
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'provided' => 'boolean',
            'file_size' => 'integer',
        ];
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(ImmigrationDossier::class, 'dossier_id');
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
