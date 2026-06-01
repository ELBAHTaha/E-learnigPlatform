<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('user')) ?? false;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'firstName' => ['sometimes', 'string', 'max:100'],
            'lastName' => ['sometimes', 'string', 'max:100'],
            'email' => ['sometimes', 'email', 'max:191', Rule::unique('users', 'email')->ignore($userId)],
            'role' => ['sometimes', 'in:admin,formateur,eleve,conseiller'],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:40'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'active' => ['sometimes', 'boolean'],
            'bio' => ['sometimes', 'nullable', 'string'],
            'specialties' => ['sometimes', 'nullable', 'array'],
            'territories' => ['sometimes', 'nullable', 'array'],
            'level' => ['sometimes', 'nullable', 'string', 'max:100'],
            'interestedPole' => ['sometimes', 'nullable', 'string', 'exists:poles,slug'],
        ];
    }

    /** Map provided camelCase fields to column names (only those present). */
    public function toAttributes(): array
    {
        $map = [
            'firstName' => 'first_name',
            'lastName' => 'last_name',
            'email' => 'email',
            'phone' => 'phone',
            'city' => 'city',
            'bio' => 'bio',
            'specialties' => 'specialties',
            'territories' => 'territories',
            'level' => 'level',
            'interestedPole' => 'interested_pole',
        ];

        $attrs = [];
        foreach ($map as $in => $col) {
            if ($this->has($in)) {
                $attrs[$col] = $this->input($in);
            }
        }
        if ($this->has('active')) {
            $attrs['is_active'] = $this->boolean('active');
        }

        return $attrs;
    }
}
