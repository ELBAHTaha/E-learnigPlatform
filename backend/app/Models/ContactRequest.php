<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'phone', 'email', 'subject', 'message',
        'pole', 'channel', 'status', 'dossier_id',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(ImmigrationDossier::class, 'dossier_id');
    }
}
