<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'body' => $this->body,
            // null/empty target_roles => "tous"; otherwise the array of role slugs
            'audience' => empty($this->target_roles) ? 'tous' : $this->target_roles,
            'publishedAt' => ($this->published_at ?? $this->created_at)?->toISOString(),
            'author' => $this->author_name ?? $this->author?->fullName(),
            'pinned' => (bool) $this->pinned,
        ];
    }
}
