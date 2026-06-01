<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'firstName' => ['required', 'string', 'max:100'],
            'lastName' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:191', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'phone' => ['nullable', 'string', 'max:40'],
            'city' => ['nullable', 'string', 'max:100'],
            'interestedPole' => ['nullable', 'string', 'exists:poles,slug'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Un compte existe déjà avec cet email.',
        ];
    }

    /** Mapped to the users table columns. */
    public function toAttributes(): array
    {
        return [
            'first_name' => $this->input('firstName'),
            'last_name' => $this->input('lastName'),
            'email' => $this->input('email'),
            'phone' => $this->input('phone'),
            'city' => $this->input('city'),
            'interested_pole' => $this->input('interestedPole'),
        ];
    }
}
