<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGradeRequest;
use App\Http\Resources\GradeResource;
use App\Models\Formation;
use App\Models\Grade;
use App\Notifications\GradePublished;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GradeController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $query = Grade::query()->orderBy('date');

        if ($user->hasRole('eleve')) {
            $query->where('eleve_id', $user->id);
        } elseif ($user->hasRole('formateur')) {
            // Formateurs see grades for the formations they teach (+ any filter).
            $query->whereHas('formation', fn ($q) => $q->where('formateur_id', $user->id));
        }

        $query->when($request->filled('eleveId'), fn ($q) => $q->where('eleve_id', $request->integer('eleveId')))
            ->when($request->filled('formationId'), fn ($q) => $q->where('formation_id', $request->integer('formationId')));

        return GradeResource::collection($query->get());
    }

    public function store(StoreGradeRequest $request): JsonResponse
    {
        $formation = Formation::findOrFail($request->integer('formationId'));
        $this->authorize('manageForFormation', [Grade::class, $formation]);

        $grade = Grade::create([
            'eleve_id' => $request->integer('eleveId'),
            'formation_id' => $formation->id,
            'assessment_id' => $request->input('assessmentId'),
            'label' => $request->input('assessment'),
            'score' => $request->input('score'),
            'out_of' => $request->input('outOf'),
            'date' => $request->input('date') ?: now()->toDateString(),
            'comment' => $request->input('comment'),
            'entered_by' => $request->user()->id,
        ]);

        $grade->eleve?->notify(new GradePublished($grade->fresh('formation')));

        return (new GradeResource($grade))->response()->setStatusCode(201);
    }

    public function destroy(Grade $grade): JsonResponse
    {
        $this->authorize('delete', $grade);
        $grade->delete();

        return response()->json(null, 204);
    }

    /**
     * GET /me/grades — the student's grades plus per-formation averages and a
     * progression series (normalised to /20) for charts.
     */
    public function myGrades(Request $request): JsonResponse
    {
        $grades = Grade::with('formation')
            ->where('eleve_id', $request->user()->id)
            ->orderBy('date')
            ->get();

        $byFormation = $grades->groupBy('formation_id')->map(function ($items, $formationId) {
            $normalised = $items->map(fn ($g) => $g->out_of > 0 ? round($g->score / $g->out_of * 20, 2) : 0);

            return [
                'formationId' => (string) $formationId,
                'formationTitle' => $items->first()->formation?->title,
                'count' => $items->count(),
                'average' => round($normalised->avg() ?? 0, 2), // out of 20
                'series' => $items->map(fn ($g) => [
                    'date' => $g->date?->toDateString(),
                    'label' => $g->label,
                    'score' => (float) $g->score,
                    'outOf' => (float) $g->out_of,
                    'score20' => $g->out_of > 0 ? round($g->score / $g->out_of * 20, 2) : 0,
                ])->values(),
            ];
        })->values();

        return response()->json([
            'grades' => GradeResource::collection($grades)->resolve(),
            'byFormation' => $byFormation,
            'overallAverage' => round($byFormation->avg('average') ?? 0, 2),
        ]);
    }
}
