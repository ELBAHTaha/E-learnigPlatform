<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\User::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'firstName' => ['required', 'string', 'max:100'],
            'lastName' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:191', 'unique:users,email'],
            'role' => ['required', 'in:admin,formateur,eleve,conseiller'],
            'password' => ['nullable', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:40'],
            'city' => ['nullable', 'string', 'max:100'],
            'active' => ['sometimes', 'boolean'],
            'bio' => ['nullable', 'string'],
            'specialties' => ['nullable', 'array'],
            'territories' => ['nullable', 'array'],
            'level' => ['nullable', 'string', 'max:100'],
            'interestedPole' => ['nullable', 'string', 'exists:poles,slug'],
        ];
    }

    public function toAttributes(): array
    {
        return array_filter([
            'first_name' => $this->input('firstName'),
            'last_name' => $this->input('lastName'),
            'email' => $this->input('email'),
            'phone' => $this->input('phone'),
            'city' => $this->input('city'),
            'is_active' => $this->boolean('active', true),
            'bio' => $this->input('bio'),
            'specialties' => $this->input('specialties'),
            'territories' => $this->input('territories'),
            'level' => $this->input('level'),
            'interested_pole' => $this->input('interestedPole'),
        ], fn ($v) => $v !== null);
    }
}
