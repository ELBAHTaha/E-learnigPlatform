<?php

namespace App\Http\Requests;

use App\Models\Announcement;
use Illuminate\Foundation\Http\FormRequest;

class StoreAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Announcement::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:191'],
            'body' => ['required', 'string'],
            // "tous" string, or an array of role slugs
            'audience' => ['nullable'],
            'audience.*' => ['in:admin,formateur,eleve,conseiller'],
            'author' => ['nullable', 'string', 'max:120'],
            'pinned' => ['sometimes', 'boolean'],
        ];
    }

    /** Returns the normalised target_roles array (null = everyone / "tous"). */
    public function targetRoles(): ?array
    {
        $audience = $this->input('audience');
        if (empty($audience) || $audience === 'tous') {
            return null;
        }

        return is_array($audience) ? array_values($audience) : [$audience];
    }
}
