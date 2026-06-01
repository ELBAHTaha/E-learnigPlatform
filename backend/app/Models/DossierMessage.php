<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DossierMessage extends Model
{
    use HasFactory;

    protected $fillable = ['dossier_id', 'sender_id', 'author_name', 'body', 'channel'];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(ImmigrationDossier::class, 'dossier_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
