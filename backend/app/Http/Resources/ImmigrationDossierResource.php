<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImmigrationDossierResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'eleveId' => (string) $this->eleve_id,
            'destination' => $this->destination_country,
            'programType' => $this->program_type,
            'type' => $this->type,
            'status' => $this->status,
            'conseillerId' => $this->conseiller_id ? (string) $this->conseiller_id : null,
            'openedAt' => ($this->opened_at ?? $this->created_at)?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'documents' => ImmigrationDocumentResource::collection(
                $this->whenLoaded('documents', $this->documents)
            ),
            'notes' => DossierMessageResource::collection(
                $this->whenLoaded('messages', $this->messages)
            ),
        ];
    }
}
