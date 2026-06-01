<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('room')) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'capacity' => ['sometimes', 'integer', 'min:0'],
            'building' => ['sometimes', 'nullable', 'string', 'max:120'],
            'equipment' => ['sometimes', 'nullable', 'array'],
            'equipment.*' => ['string', 'max:120'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }

    public function toAttributes(): array
    {
        $attrs = [];
        foreach (['name' => 'name', 'capacity' => 'capacity', 'building' => 'building', 'equipment' => 'equipment'] as $in => $col) {
            if ($this->has($in)) {
                $attrs[$col] = $this->input($in);
            }
        }
        if ($this->has('isActive')) {
            $attrs['is_active'] = $this->boolean('isActive');
        }

        return $attrs;
    }
}
