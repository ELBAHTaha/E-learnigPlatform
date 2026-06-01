<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImmigrationDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'required' => (bool) $this->is_required,
            'provided' => (bool) $this->provided,
            'status' => $this->status,
            'notes' => $this->notes,
            'hasFile' => (bool) $this->file_path,
            'downloadUrl' => $this->when((bool) $this->file_path, fn () => url("/api/documents/{$this->id}/download")),
        ];
    }
}
