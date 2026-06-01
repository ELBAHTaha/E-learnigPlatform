<?php

namespace App\Http\Requests;

use App\Models\Formation;
use Illuminate\Foundation\Http\FormRequest;

class StoreFormationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Formation::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:191'],
            'pole' => ['required', 'string', 'exists:poles,slug'],
            'subcategory' => ['nullable', 'string', 'max:120'],
            'level' => ['required', 'string', 'max:60'],
            'description' => ['required', 'string'],
            'longDescription' => ['nullable', 'string'],
            'duration' => ['nullable', 'string', 'max:120'],
            'price' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:8'],
            'paymentOptions' => ['nullable', 'array'],
            'schedule' => ['nullable', 'string', 'max:191'],
            'formateurId' => ['nullable', 'integer', 'exists:users,id'],
            'capacity' => ['required', 'integer', 'min:0'],
            'rating' => ['nullable', 'numeric', 'between:0,5'],
            'highlights' => ['nullable', 'array'],
            'documentsRequired' => ['nullable', 'array'],
            'modality' => ['nullable', 'in:Présentiel,À distance,Hybride'],
            'imageColor' => ['nullable', 'string', 'max:16'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }
}
