<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Formation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'pole_id', 'category_id', 'description', 'long_description',
        'level', 'modality', 'duration', 'price', 'currency', 'payment_options',
        'schedule', 'capacity', 'rating', 'highlights', 'documents_required',
        'image_color', 'cover_image_path', 'is_active', 'formateur_id',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'rating' => 'decimal:1',
            'capacity' => 'integer',
            'is_active' => 'boolean',
            'payment_options' => 'array',
            'highlights' => 'array',
            'documents_required' => 'array',
        ];
    }

    // Route-model binding resolves by id (the SPA addresses formations by id).
    // The public show() endpoint additionally accepts a slug for SEO URLs.

    // --- Relationships ---

    public function pole(): BelongsTo
    {
        return $this->belongsTo(Pole::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function formateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'formateur_id');
    }

    public function materials(): HasMany
    {
        return $this->hasMany(CourseMaterial::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(ClassSession::class);
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    // --- Helpers ---

    public function approvedEnrollmentsCount(): int
    {
        return $this->enrollments()->where('status', 'approuvee')->count();
    }

    // --- Scopes ---

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
