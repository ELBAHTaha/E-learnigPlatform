<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'firstName' => ['sometimes', 'string', 'max:100'],
            'lastName' => ['sometimes', 'string', 'max:100'],
            'email' => ['sometimes', 'email', 'max:191', Rule::unique('users', 'email')->ignore($this->user()->id)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:40'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'bio' => ['sometimes', 'nullable', 'string'],
            'specialties' => ['sometimes', 'nullable', 'array'],
            'level' => ['sometimes', 'nullable', 'string', 'max:100'],
            'interestedPole' => ['sometimes', 'nullable', 'string', 'exists:poles,slug'],
            'currentPassword' => ['sometimes', 'required_with:password', 'current_password'],
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function toAttributes(): array
    {
        $map = [
            'firstName' => 'first_name', 'lastName' => 'last_name', 'email' => 'email',
            'phone' => 'phone', 'city' => 'city', 'bio' => 'bio',
            'specialties' => 'specialties', 'level' => 'level', 'interestedPole' => 'interested_pole',
        ];
        $attrs = [];
        foreach ($map as $in => $col) {
            if ($this->has($in)) {
                $attrs[$col] = $this->input($in);
            }
        }

        return $attrs;
    }
}
