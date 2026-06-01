<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Resources\EnrollmentResource;
use App\Http\Resources\FormationResource;
use App\Models\Enrollment;
use App\Models\Formation;
use App\Notifications\EnrollmentDecided;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class EnrollmentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $query = Enrollment::query()->latest('id');

        // Élèves only ever see their own enrollment requests.
        if ($user->hasRole('eleve') && ! $user->hasPermissionTo('enrollments.decide')) {
            $query->where('eleve_id', $user->id);
        } else {
            $query->when($request->filled('eleveId'), fn ($q) => $q->where('eleve_id', $request->integer('eleveId')));
        }

        $query->when($request->filled('formationId'), fn ($q) => $q->where('formation_id', $request->integer('formationId')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')));

        return EnrollmentResource::collection($query->get());
    }

    public function store(StoreEnrollmentRequest $request): JsonResponse
    {
        $user = $request->user();

        // Students may only enroll themselves; admins may enroll anyone.
        $eleveId = $user->hasPermissionTo('enrollments.decide')
            ? ($request->integer('eleveId') ?: $user->id)
            : $user->id;

        $formation = Formation::findOrFail($request->integer('formationId'));

        if (Enrollment::where('eleve_id', $eleveId)->where('formation_id', $formation->id)->exists()) {
            throw ValidationException::withMessages([
                'formationId' => ['Une inscription existe déjà pour cette formation.'],
            ])->status(409);
        }

        $enrollment = Enrollment::create([
            'eleve_id' => $eleveId,
            'formation_id' => $formation->id,
            'status' => Enrollment::PENDING,
            'requested_pole' => $formation->pole?->slug,
            'requested_level' => $request->input('requestedLevel'),
            'message' => $request->input('message'),
            'progress' => 0,
            'requested_at' => now(),
        ]);

        return (new EnrollmentResource($enrollment))->response()->setStatusCode(201);
    }

    /** POST /enrollments/{enrollment}/decide — admin approves or rejects. */
    public function decide(Request $request, Enrollment $enrollment): EnrollmentResource
    {
        $this->authorize('decide', $enrollment);

        $data = $request->validate([
            'status' => ['required', 'in:approuvee,refusee'],
        ]);

        $enrollment->update([
            'status' => $data['status'],
            'decided_by' => $request->user()->id,
            'decided_at' => now(),
        ]);

        $enrollment->eleve?->notify(new EnrollmentDecided($enrollment->fresh('formation')));

        return new EnrollmentResource($enrollment);
    }

    /** GET /me/formations — the authenticated student's approved formations. */
    public function myFormations(Request $request): AnonymousResourceCollection
    {
        $formationIds = Enrollment::where('eleve_id', $request->user()->id)
            ->where('status', Enrollment::APPROVED)
            ->pluck('formation_id');

        $formations = Formation::with(['pole', 'category'])
            ->withCount(['enrollments as approved_enrollments_count' => fn ($q) => $q->where('status', 'approuvee')])
            ->whereIn('id', $formationIds)
            ->get();

        return FormationResource::collection($formations);
    }
}
