<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermissionTo('enrollments.request')
            || $this->user()?->hasPermissionTo('enrollments.decide')
            || false;
    }

    public function rules(): array
    {
        return [
            'formationId' => ['required', 'integer', 'exists:formations,id'],
            'eleveId' => ['nullable', 'integer', 'exists:users,id'],
            'requestedLevel' => ['nullable', 'string', 'max:100'],
            'message' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
