<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'formationId' => ['required', 'integer', 'exists:formations,id'],
            'type' => ['required', 'in:cours,exercice,corrige,video'],
            'title' => ['required', 'string', 'max:191'],
            'description' => ['nullable', 'string'],
            'file' => ['nullable', 'file', 'mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,jpg,jpeg,png,webp,mp4,mov,zip', 'max:204800'],
            'externalVideoUrl' => ['nullable', 'url', 'max:500'],
            'url' => ['nullable', 'string', 'max:500'],
        ];
    }
}
