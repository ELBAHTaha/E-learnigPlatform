<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    use HasFactory;

    public const PENDING = 'en-attente';
    public const APPROVED = 'approuvee';
    public const REJECTED = 'refusee';
    public const COMPLETED = 'terminee';

    protected $fillable = [
        'eleve_id', 'formation_id', 'status', 'requested_pole', 'requested_level',
        'message', 'progress', 'requested_at', 'decided_by', 'decided_at',
    ];

    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'decided_at' => 'datetime',
            'progress' => 'integer',
        ];
    }

    public function eleve(): BelongsTo
    {
        return $this->belongsTo(User::class, 'eleve_id');
    }

    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class);
    }

    public function decidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}
