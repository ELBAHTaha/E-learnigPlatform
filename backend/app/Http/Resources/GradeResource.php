<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'eleveId' => (string) $this->eleve_id,
            'formationId' => (string) $this->formation_id,
            'assessment' => $this->label,
            'score' => (float) $this->score,
            'outOf' => (float) $this->out_of,
            'date' => $this->date?->toDateString(),
            'comment' => $this->comment,
        ];
    }
}
