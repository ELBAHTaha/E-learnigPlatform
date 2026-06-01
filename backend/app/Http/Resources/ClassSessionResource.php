<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // The host (start) URL is private: only the trainer of the session or an
        // admin may see it.
        $user = $request->user();
        $canSeeHost = $user && ($user->hasRole('admin') || $user->id === $this->formateur_id);

        return [
            'id' => (string) $this->id,
            'formationId' => (string) $this->formation_id,
            'formateurId' => $this->formateur_id ? (string) $this->formateur_id : null,
            'roomId' => $this->room_id ? (string) $this->room_id : null,
            'start' => $this->starts_at?->toISOString(),
            'end' => $this->ends_at?->toISOString(),
            'title' => $this->title,
            'isOnline' => (bool) $this->is_online,
            'meetingUrl' => $this->meeting_url,
            'meetingProvider' => $this->meeting_provider,
            'status' => $this->status,
            'meetingHostUrl' => $this->when($canSeeHost && $this->meeting_host_url, $this->meeting_host_url),
        ];
    }
}
