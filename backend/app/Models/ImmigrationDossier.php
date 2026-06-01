<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ImmigrationDossier extends Model
{
    use HasFactory;

    public const STATUSES = [
        'nouveau', 'en-cours', 'documents-requis', 'soumis', 'finalise', 'rejete',
    ];

    protected $fillable = [
        'eleve_id', 'conseiller_id', 'type', 'destination_country',
        'program_type', 'status', 'notes', 'opened_at',
    ];

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
        ];
    }

    public function eleve(): BelongsTo
    {
        return $this->belongsTo(User::class, 'eleve_id');
    }

    public function conseiller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'conseiller_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ImmigrationDocument::class, 'dossier_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(DossierMessage::class, 'dossier_id');
    }
}
