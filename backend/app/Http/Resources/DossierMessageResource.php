<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DossierMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Shaped as the frontend "note": { id, author, date, content }
        return [
            'id' => (string) $this->id,
            'author' => $this->author_name ?? $this->sender?->fullName(),
            'date' => $this->created_at?->toISOString(),
            'content' => $this->body,
            'channel' => $this->channel,
        ];
    }
}
