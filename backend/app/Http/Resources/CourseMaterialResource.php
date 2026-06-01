<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseMaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'formationId' => (string) $this->formation_id,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'uploadedAt' => $this->created_at?->toISOString(),
            'size' => $this->file_size ? $this->humanSize($this->file_size) : null,
            // External videos link out; everything else streams through the
            // authorized download endpoint (which gates corrigés).
            'url' => $this->external_video_url
                ?: ($this->file_path ? url("/api/materials/{$this->id}/download") : null),
            'restricted' => $this->type === 'corrige' || $this->disk === 'private',
        ];
    }

    private function humanSize(int $bytes): string
    {
        $mb = $bytes / (1024 * 1024);
        if ($mb >= 1) {
            return round($mb, 1).' MB';
        }

        return round($bytes / 1024, 1).' KB';
    }
}
