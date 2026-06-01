<?php

namespace App\Http\Requests;

use App\Models\ImmigrationDossier;
use Illuminate\Foundation\Http\FormRequest;

class StoreDossierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', ImmigrationDossier::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'eleveId' => ['nullable', 'integer', 'exists:users,id'],
            'destination' => ['required', 'string', 'max:120'],
            'programType' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', 'string', 'max:120'],
            'conseillerId' => ['nullable', 'integer', 'exists:users,id'],
            'documents' => ['nullable', 'array'],
            'documents.*' => ['string', 'max:191'],
        ];
    }
}
