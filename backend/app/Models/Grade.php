<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'eleve_id', 'formation_id', 'assessment_id', 'label',
        'score', 'out_of', 'date', 'comment', 'entered_by',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'out_of' => 'decimal:2',
            'date' => 'date',
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

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function enteredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'entered_by');
    }
}
