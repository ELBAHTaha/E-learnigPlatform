<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFormationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('formation')) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:191'],
            'pole' => ['sometimes', 'string', 'exists:poles,slug'],
            'subcategory' => ['sometimes', 'nullable', 'string', 'max:120'],
            'level' => ['sometimes', 'string', 'max:60'],
            'description' => ['sometimes', 'string'],
            'longDescription' => ['sometimes', 'nullable', 'string'],
            'duration' => ['sometimes', 'nullable', 'string', 'max:120'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'string', 'max:8'],
            'paymentOptions' => ['sometimes', 'nullable', 'array'],
            'schedule' => ['sometimes', 'nullable', 'string', 'max:191'],
            'formateurId' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'capacity' => ['sometimes', 'integer', 'min:0'],
            'rating' => ['sometimes', 'nullable', 'numeric', 'between:0,5'],
            'highlights' => ['sometimes', 'nullable', 'array'],
            'documentsRequired' => ['sometimes', 'nullable', 'array'],
            'modality' => ['sometimes', 'nullable', 'in:Présentiel,À distance,Hybride'],
            'imageColor' => ['sometimes', 'nullable', 'string', 'max:16'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }
}
