<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermissionTo('grades.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'eleveId' => ['required', 'integer', 'exists:users,id'],
            'formationId' => ['required', 'integer', 'exists:formations,id'],
            'assessment' => ['required', 'string', 'max:191'],
            'assessmentId' => ['nullable', 'integer', 'exists:assessments,id'],
            'score' => ['required', 'numeric', 'min:0'],
            'outOf' => ['required', 'numeric', 'min:1'],
            'date' => ['nullable', 'date'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
