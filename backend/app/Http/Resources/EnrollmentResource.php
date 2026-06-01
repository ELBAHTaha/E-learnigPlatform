<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnrollmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'eleveId' => (string) $this->eleve_id,
            'formationId' => (string) $this->formation_id,
            'status' => $this->status,
            'requestedAt' => ($this->requested_at ?? $this->created_at)?->toISOString(),
            'decidedAt' => $this->decided_at?->toISOString(),
            'progress' => (int) $this->progress,
        ];
    }
}
