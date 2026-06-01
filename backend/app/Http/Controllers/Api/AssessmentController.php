<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAssessmentRequest;
use App\Http\Resources\AssessmentResource;
use App\Models\Assessment;
use App\Models\Formation;
use App\Models\Grade;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AssessmentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $assessments = Assessment::query()
            ->when($request->filled('formation'), fn ($q) => $q->where('formation_id', $request->integer('formation')))
            ->when($request->filled('formationId'), fn ($q) => $q->where('formation_id', $request->integer('formationId')))
            ->orderBy('date')
            ->get();

        return AssessmentResource::collection($assessments);
    }

    public function store(StoreAssessmentRequest $request): JsonResponse
    {
        $formation = Formation::findOrFail($request->integer('formationId'));
        $this->authorize('manageForFormation', [Grade::class, $formation]);

        $assessment = Assessment::create([
            'formation_id' => $formation->id,
            'title' => $request->input('title'),
            'type' => $request->input('type', 'devoir'),
            'max_score' => $request->input('maxScore', 20),
            'weight' => $request->input('weight', 1),
            'date' => $request->input('date'),
        ]);

        return (new AssessmentResource($assessment))->response()->setStatusCode(201);
    }
}
