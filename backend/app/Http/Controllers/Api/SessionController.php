<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSessionRequest;
use App\Http\Resources\ClassSessionResource;
use App\Models\ClassSession;
use App\Models\Enrollment;
use App\Services\Meeting\JitsiMeetingService;
use Illuminate\Support\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class SessionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $query = ClassSession::query()->orderBy('starts_at');

        // Élèves only see sessions of formations they are approved in.
        if ($user->hasRole('eleve')) {
            $ids = Enrollment::where('eleve_id', $user->id)->where('status', Enrollment::APPROVED)->pluck('formation_id');
            $query->whereIn('formation_id', $ids);
        }

        if ($request->filled('eleveId')) {
            $ids = Enrollment::where('eleve_id', $request->integer('eleveId'))->where('status', Enrollment::APPROVED)->pluck('formation_id');
            $query->whereIn('formation_id', $ids);
        }

        $query->when($request->filled('formateurId'), fn ($q) => $q->where('formateur_id', $request->integer('formateurId')))
            ->when($request->filled('formationId'), fn ($q) => $q->where('formation_id', $request->integer('formationId')))
            ->when($request->filled('from'), fn ($q) => $q->where('starts_at', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($q) => $q->where('starts_at', '<=', $request->date('to')));

        return ClassSessionResource::collection($query->get());
    }

    public function store(StoreSessionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $this->assertNoConflict(
            $data['start'], $data['end'],
            $data['formateurId'] ?? null, $data['roomId'] ?? null, null
        );

        $session = ClassSession::create([
            'formation_id' => $data['formationId'],
            'formateur_id' => $data['formateurId'] ?? null,
            'room_id' => $data['roomId'] ?? null,
            'title' => $data['title'],
            'starts_at' => $data['start'],
            'ends_at' => $data['end'],
            'is_online' => $data['isOnline'] ?? (($data['roomId'] ?? null) === null),
            'meeting_url' => $data['meetingUrl'] ?? null,
            'recurrence' => $data['recurrence'] ?? 'none',
            'recurrence_days' => $data['recurrenceDays'] ?? null,
            'status' => 'scheduled',
        ]);

        return (new ClassSessionResource($session))->response()->setStatusCode(201);
    }

    public function update(StoreSessionRequest $request, ClassSession $session): ClassSessionResource
    {
        $this->authorize('update', $session);
        $data = $request->validated();
        $this->assertNoConflict(
            $data['start'], $data['end'],
            $data['formateurId'] ?? $session->formateur_id, $data['roomId'] ?? $session->room_id, $session->id
        );

        $session->update([
            'formation_id' => $data['formationId'],
            'formateur_id' => $data['formateurId'] ?? null,
            'room_id' => $data['roomId'] ?? null,
            'title' => $data['title'],
            'starts_at' => $data['start'],
            'ends_at' => $data['end'],
            'is_online' => $data['isOnline'] ?? $session->is_online,
            'meeting_url' => $data['meetingUrl'] ?? $session->meeting_url,
        ]);

        return new ClassSessionResource($session);
    }

    public function destroy(ClassSession $session): JsonResponse
    {
        $this->authorize('delete', $session);
        $session->delete();

        return response()->json(null, 204);
    }

    /** POST /sessions/{session}/meeting — create (or return) the Jitsi room for the session. */
    public function createMeeting(Request $request, ClassSession $session, JitsiMeetingService $jitsi): ClassSessionResource
    {
        $this->authorize('createMeeting', $session);

        // Synchronous — Jitsi rooms need no external API call or queue. Idempotent:
        // calling twice returns the same room URL.
        $session = $jitsi->createMeeting($session);

        return new ClassSessionResource($session);
    }

    /** GET /sessions/{session}/join — every participant shares the same Jitsi URL. */
    public function join(Request $request, ClassSession $session, JitsiMeetingService $jitsi): JsonResponse
    {
        $user = $request->user();

        // Students must be enrolled & approved to obtain a join link.
        if ($user->hasRole('eleve')) {
            $enrolled = Enrollment::where('eleve_id', $user->id)
                ->where('formation_id', $session->formation_id)
                ->where('status', Enrollment::APPROVED)->exists();
            abort_unless($enrolled, 403, 'Vous n\'êtes pas inscrit à cette formation.');
        }

        $url = $jitsi->getJoinUrl($session);

        if (! $url) {
            return response()->json(['message' => 'Aucune réunion n\'est associée à cette séance.'], 404);
        }

        return response()->json(['meeting_url' => $url, 'room' => $session->meeting_id]);
    }

    /**
     * Reject overlapping sessions sharing the same room or the same trainer.
     */
    private function assertNoConflict(string $start, string $end, ?int $formateurId, ?int $roomId, ?int $ignoreId): void
    {
        // Bind Carbon instances (not raw ISO strings) so the query builder formats
        // them to the connection's datetime format. Comparing the stored
        // "Y-m-d H:i:s" columns against an ISO "...T..Z" string breaks under SQLite's
        // lexicographic comparison and would silently miss overlaps.
        $startAt = Carbon::parse($start);
        $endAt = Carbon::parse($end);

        $overlap = ClassSession::query()
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->where('starts_at', '<', $endAt)
            ->where('ends_at', '>', $startAt)
            ->where(function ($q) use ($formateurId, $roomId) {
                $q->when($formateurId, fn ($w) => $w->orWhere('formateur_id', $formateurId));
                $q->when($roomId, fn ($w) => $w->orWhere('room_id', $roomId));
            })
            ->first();

        if ($overlap) {
            $reason = $overlap->room_id === $roomId && $roomId !== null
                ? 'La salle est déjà occupée sur ce créneau.'
                : 'Le formateur a déjà une séance sur ce créneau.';
            throw ValidationException::withMessages(['start' => [$reason]])->status(409);
        }
    }
}
