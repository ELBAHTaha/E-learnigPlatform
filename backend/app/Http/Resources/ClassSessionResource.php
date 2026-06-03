<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'formationId' => (string) $this->formation_id,
            'formateurId' => $this->formateur_id ? (string) $this->formateur_id : null,
            'roomId' => $this->room_id ? (string) $this->room_id : null,
            'start' => $this->starts_at?->toISOString(),
            'end' => $this->ends_at?->toISOString(),
            'title' => $this->title,
            'isOnline' => (bool) $this->is_online,
            // Jitsi: a single shared room URL + its room name (no host/guest split).
            'meetingUrl' => $this->meeting_url,
            'meetingId' => $this->meeting_id,
            'status' => $this->status,
        ];
    }
}
