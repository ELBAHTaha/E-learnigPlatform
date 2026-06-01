<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermissionTo('grades.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'formationId' => ['required', 'integer', 'exists:formations,id'],
            'title' => ['required', 'string', 'max:191'],
            'type' => ['nullable', 'in:devoir,examen,quiz'],
            'maxScore' => ['nullable', 'numeric', 'min:1'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'date' => ['nullable', 'date'],
        ];
    }
}
