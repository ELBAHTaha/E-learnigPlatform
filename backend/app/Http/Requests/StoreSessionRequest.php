<?php

namespace App\Http\Requests;

use App\Models\ClassSession;
use Illuminate\Foundation\Http\FormRequest;

class StoreSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', ClassSession::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'formationId' => ['required', 'integer', 'exists:formations,id'],
            'formateurId' => ['nullable', 'integer', 'exists:users,id'],
            'roomId' => ['nullable', 'integer', 'exists:rooms,id'],
            'title' => ['required', 'string', 'max:191'],
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after:start'],
            'isOnline' => ['sometimes', 'boolean'],
            'meetingUrl' => ['nullable', 'url', 'max:500'],
            'meetingProvider' => ['nullable', 'in:zoom,google_meet,manual'],
            'recurrence' => ['nullable', 'in:none,weekly'],
            'recurrenceDays' => ['nullable', 'array'],
        ];
    }
}
