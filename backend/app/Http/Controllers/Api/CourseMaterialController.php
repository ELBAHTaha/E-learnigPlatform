<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMaterialRequest;
use App\Http\Resources\CourseMaterialResource;
use App\Models\CourseMaterial;
use App\Models\Formation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CourseMaterialController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $materials = CourseMaterial::query()
            ->when($request->filled('formationId'), fn ($q) => $q->where('formation_id', $request->integer('formationId')))
            ->orderBy('order')
            ->orderBy('id')
            ->get();

        return CourseMaterialResource::collection($materials);
    }

    public function store(StoreMaterialRequest $request): JsonResponse
    {
        $formation = Formation::findOrFail($request->integer('formationId'));
        $this->authorize('createForFormation', [CourseMaterial::class, $formation]);

        $type = $request->input('type');
        $disk = $type === 'corrige' ? 'private' : 'public';

        $attrs = [
            'formation_id' => $formation->id,
            'uploader_id' => $request->user()->id,
            'type' => $type,
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'external_video_url' => $request->input('externalVideoUrl') ?: ($type === 'video' ? $request->input('url') : null),
            'disk' => $disk,
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $attrs['file_path'] = $file->store('materials/'.$formation->id, $disk);
            $attrs['original_filename'] = $file->getClientOriginalName();
            $attrs['file_size'] = $file->getSize();
        }

        $material = CourseMaterial::create($attrs);

        return (new CourseMaterialResource($material))->response()->setStatusCode(201);
    }

    public function destroy(CourseMaterial $material): JsonResponse
    {
        $this->authorize('delete', $material);

        if ($material->file_path) {
            Storage::disk($material->disk)->delete($material->file_path);
        }
        $material->delete();

        return response()->json(null, 204);
    }

    /** Authorized streamed download — corrigés / private files are gated here. */
    public function download(CourseMaterial $material): StreamedResponse|JsonResponse
    {
        $this->authorize('download', $material);

        if ($material->external_video_url && ! $material->file_path) {
            return response()->json(['url' => $material->external_video_url]);
        }

        $disk = Storage::disk($material->disk);
        if (! $material->file_path || ! $disk->exists($material->file_path)) {
            return response()->json(['message' => 'Fichier introuvable.'], 404);
        }

        return $disk->download($material->file_path, $material->original_filename ?? $material->title);
    }
}
