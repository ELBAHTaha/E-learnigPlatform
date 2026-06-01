<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ImmigrationDocumentResource;
use App\Models\ImmigrationDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImmigrationDocumentController extends Controller
{
    /** POST /documents/{document}/upload — store a file on the private disk. */
    public function upload(Request $request, ImmigrationDocument $document): ImmigrationDocumentResource
    {
        $this->authorizeAccess($request, $document, manage: false);

        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp,doc,docx', 'max:20480'],
        ]);

        if ($document->file_path) {
            Storage::disk('private')->delete($document->file_path);
        }

        $file = $request->file('file');
        $path = $file->store('immigration/'.$document->dossier_id, 'private');

        $document->update([
            'disk' => 'private',
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'provided' => true,
            'status' => 'fourni',
            'uploaded_by' => $request->user()->id,
        ]);

        return new ImmigrationDocumentResource($document);
    }

    /** PUT /documents/{document}/verify — conseiller validates or rejects. */
    public function verify(Request $request, ImmigrationDocument $document): ImmigrationDocumentResource
    {
        $this->authorizeAccess($request, $document, manage: true);

        $data = $request->validate([
            'status' => ['required', 'in:valide,refuse'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $document->update([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? $document->notes,
            'verified_by' => $request->user()->id,
        ]);

        return new ImmigrationDocumentResource($document);
    }

    /** GET /documents/{document}/download — authorized streamed download. */
    public function download(Request $request, ImmigrationDocument $document): StreamedResponse|JsonResponse
    {
        $this->authorizeAccess($request, $document, manage: false);

        $disk = Storage::disk($document->disk ?: 'private');
        if (! $document->file_path || ! $disk->exists($document->file_path)) {
            return response()->json(['message' => 'Fichier introuvable.'], 404);
        }

        return $disk->download($document->file_path, $document->original_filename ?? $document->name);
    }

    /**
     * Gate access to a document: the owning student, the managing conseiller,
     * or an admin. When $manage is true, only conseiller/admin pass.
     */
    private function authorizeAccess(Request $request, ImmigrationDocument $document, bool $manage): void
    {
        $user = $request->user();
        $dossier = $document->dossier;

        if ($user->hasRole('admin') || $user->hasPermissionTo('immigration.manage')) {
            return;
        }

        if ($manage) {
            abort(403, 'Action réservée à un conseiller.');
        }

        abort_unless($dossier && $dossier->eleve_id === $user->id, 403);
    }
}
