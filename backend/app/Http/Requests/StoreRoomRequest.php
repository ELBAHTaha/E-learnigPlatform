<?php

namespace App\Http\Requests;

use App\Models\Room;
use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Room::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'capacity' => ['required', 'integer', 'min:0'],
            'building' => ['nullable', 'string', 'max:120'],
            'equipment' => ['nullable', 'array'],
            'equipment.*' => ['string', 'max:120'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }

    public function toAttributes(): array
    {
        return array_filter([
            'name' => $this->input('name'),
            'capacity' => $this->input('capacity'),
            'building' => $this->input('building'),
            'equipment' => $this->input('equipment', []),
            'is_active' => $this->boolean('isActive', true),
        ], fn ($v) => $v !== null);
    }
}
