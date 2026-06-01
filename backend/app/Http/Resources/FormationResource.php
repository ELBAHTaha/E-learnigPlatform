<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // "enrolled" = approved enrollments. Prefer a pre-loaded withCount value
        // (approved_enrollments_count) to avoid N+1 queries on list endpoints.
        $enrolled = $this->approved_enrollments_count
            ?? $this->enrollments()->where('status', 'approuvee')->count();

        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'pole' => $this->pole?->slug,
            'subcategory' => $this->category?->label,
            'level' => $this->level,
            'description' => $this->description,
            'longDescription' => $this->long_description,
            'duration' => $this->duration,
            'price' => (float) $this->price,
            'currency' => $this->currency,
            'paymentOptions' => $this->payment_options,
            'schedule' => $this->schedule,
            'formateurId' => $this->formateur_id ? (string) $this->formateur_id : null,
            'capacity' => (int) $this->capacity,
            'enrolled' => (int) $enrolled,
            'rating' => $this->rating !== null ? (float) $this->rating : null,
            'highlights' => $this->highlights,
            'documentsRequired' => $this->documents_required,
            'modality' => $this->modality,
            'imageColor' => $this->image_color,
            'isActive' => (bool) $this->is_active,
        ];
    }
}
