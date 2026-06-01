<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->slug,
            'slug' => $this->slug,
            'label' => $this->label,
            'tagline' => $this->tagline,
            'color' => $this->color,
            'subcategories' => $this->whenLoaded('categories', fn () => $this->categories->pluck('label')),
        ];
    }
}
