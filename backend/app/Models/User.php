<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'city',
        'avatar_path',
        'locale',
        'is_active',
        // role-specific profile fields
        'bio',
        'specialties',
        'territories',
        'level',
        'interested_pole',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'specialties' => 'array',
            'territories' => 'array',
        ];
    }

    /**
     * The single application role slug (admin|formateur|eleve|conseiller).
     * The academy assigns exactly one role per user.
     */
    public function getRoleSlugAttribute(): ?string
    {
        return $this->roles->first()?->name;
    }

    public function fullName(): string
    {
        return trim($this->first_name.' '.$this->last_name);
    }

    // --- Relationships ---

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'eleve_id');
    }

    public function formationsTaught(): HasMany
    {
        return $this->hasMany(Formation::class, 'formateur_id');
    }

    public function sessionsTaught(): HasMany
    {
        return $this->hasMany(Session::class, 'formateur_id');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class, 'eleve_id');
    }

    public function dossiers(): HasMany
    {
        return $this->hasMany(ImmigrationDossier::class, 'eleve_id');
    }

    public function dossiersHandled(): HasMany
    {
        return $this->hasMany(ImmigrationDossier::class, 'conseiller_id');
    }

    // --- Helpers ---

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }
}
