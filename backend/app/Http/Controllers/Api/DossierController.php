<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDossierRequest;
use App\Http\Resources\DossierMessageResource;
use App\Http\Resources\ImmigrationDossierResource;
use App\Models\DossierMessage;
use App\Models\ImmigrationDocument;
use App\Models\ImmigrationDossier;
use App\Notifications\DossierUpdated;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DossierController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', ImmigrationDossier::class);
        $user = $request->user();

        $query = ImmigrationDossier::query()->with(['documents', 'messages'])->latest('id');

        // Élèves only ever see their own dossiers.
        if (! $user->hasPermissionTo('immigration.manage')) {
            $query->where('eleve_id', $user->id);
        } else {
            $query->when($request->filled('eleveId'), fn ($q) => $q->where('eleve_id', $request->integer('eleveId')))
                ->when($request->filled('conseillerId'), fn ($q) => $q->where('conseiller_id', $request->integer('conseillerId')));
        }

        $query->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')));

        return ImmigrationDossierResource::collection($query->get());
    }

    public function show(ImmigrationDossier $dossier): ImmigrationDossierResource
    {
        $this->authorize('view', $dossier);

        return new ImmigrationDossierResource($dossier->load(['documents', 'messages']));
    }

    public function store(StoreDossierRequest $request): JsonResponse
    {
        $user = $request->user();
        $eleveId = $user->hasPermissionTo('immigration.manage')
            ? ($request->integer('eleveId') ?: $user->id)
            : $user->id;

        $dossier = ImmigrationDossier::create([
            'eleve_id' => $eleveId,
            'conseiller_id' => $request->integer('conseillerId') ?: ($user->hasRole('conseiller') ? $user->id : null),
            'type' => $request->input('type'),
            'destination_country' => $request->input('destination'),
            'program_type' => $request->input('programType'),
            'status' => 'nouveau',
            'opened_at' => now(),
        ]);

        foreach ($request->input('documents', []) as $name) {
            $dossier->documents()->create(['name' => $name, 'is_required' => true, 'provided' => false]);
        }

        return (new ImmigrationDossierResource($dossier->load(['documents', 'messages'])))
            ->response()->setStatusCode(201);
    }

    /** POST|PUT /dossiers/{dossier}/status — advance the workflow. */
    public function updateStatus(Request $request, ImmigrationDossier $dossier): ImmigrationDossierResource
    {
        $this->authorize('manage', $dossier);
        $data = $request->validate([
            'status' => ['required', 'in:'.implode(',', ImmigrationDossier::STATUSES)],
        ]);

        $dossier->update(['status' => $data['status']]);
        $dossier->eleve?->notify(new DossierUpdated($dossier, 'Le statut de votre dossier est désormais : '.$data['status']));

        return new ImmigrationDossierResource($dossier->load(['documents', 'messages']));
    }

    /** POST /dossiers/{dossier}/notes — add a note / message to the dossier. */
    public function addMessage(Request $request, ImmigrationDossier $dossier): ImmigrationDossierResource
    {
        $this->authorize('manage', $dossier);
        $data = $request->validate([
            'content' => ['required_without:body', 'string', 'max:5000'],
            'body' => ['required_without:content', 'string', 'max:5000'],
            'author' => ['nullable', 'string', 'max:120'],
            'channel' => ['nullable', 'in:note,email,call_request'],
        ]);

        DossierMessage::create([
            'dossier_id' => $dossier->id,
            'sender_id' => $request->user()->id,
            'author_name' => $data['author'] ?? $request->user()->fullName(),
            'body' => $data['content'] ?? $data['body'],
            'channel' => $data['channel'] ?? 'note',
        ]);

        $dossier->touch();

        return new ImmigrationDossierResource($dossier->load(['documents', 'messages']));
    }

    public function messages(ImmigrationDossier $dossier): AnonymousResourceCollection
    {
        $this->authorize('view', $dossier);

        return DossierMessageResource::collection($dossier->messages()->latest()->get());
    }

    /** POST /dossiers/{dossier}/documents — add a checklist item. */
    public function addDocument(Request $request, ImmigrationDossier $dossier): ImmigrationDossierResource
    {
        $this->authorize('manage', $dossier);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'required' => ['sometimes', 'boolean'],
        ]);

        $dossier->documents()->create([
            'name' => $data['name'],
            'is_required' => $request->boolean('required', true),
            'provided' => false,
        ]);

        return new ImmigrationDossierResource($dossier->load(['documents', 'messages']));
    }

    /** PATCH /dossiers/{dossier}/documents/{document} — toggle provided flag. */
    public function toggleDocument(Request $request, ImmigrationDossier $dossier, ImmigrationDocument $document): ImmigrationDossierResource
    {
        $this->authorize('manage', $dossier);
        abort_unless($document->dossier_id === $dossier->id, 404);

        $data = $request->validate(['provided' => ['required', 'boolean']]);
        $document->update([
            'provided' => $data['provided'],
            'status' => $data['provided'] ? 'fourni' : 'a_fournir',
        ]);

        return new ImmigrationDossierResource($dossier->load(['documents', 'messages']));
    }
}
