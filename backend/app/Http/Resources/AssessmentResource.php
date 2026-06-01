<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'formationId' => (string) $this->formation_id,
            'title' => $this->title,
            'type' => $this->type,
            'maxScore' => (float) $this->max_score,
            'weight' => (float) $this->weight,
            'date' => $this->date?->toDateString(),
        ];
    }
}
