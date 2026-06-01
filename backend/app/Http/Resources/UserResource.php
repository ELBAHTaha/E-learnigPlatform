<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $role = $this->roles->first()?->name;

        return [
            'id' => (string) $this->id,
            'email' => $this->email,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'role' => $role,
            'avatarUrl' => $this->avatar_path ? Storage::disk('public')->url($this->avatar_path) : null,
            'phone' => $this->phone,
            'city' => $this->city,
            'createdAt' => $this->created_at?->toISOString(),
            'active' => (bool) $this->is_active,
            // Role-specific profile fields (present where relevant)
            'specialties' => $this->when(! empty($this->specialties), $this->specialties),
            'bio' => $this->when(! empty($this->bio), $this->bio),
            'territories' => $this->when(! empty($this->territories), $this->territories),
            'level' => $this->when(! empty($this->level), $this->level),
            'interestedPole' => $this->when(! empty($this->interested_pole), $this->interested_pole),
        ];
    }
}
