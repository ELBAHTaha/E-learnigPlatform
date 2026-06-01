<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactRequestReceived;
use App\Models\ContactRequest;
use App\Models\DossierMessage;
use App\Models\ImmigrationDossier;
use App\Services\Chatbot\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ChatbotController extends Controller
{
    public function __construct(private ChatbotService $chatbot)
    {
    }

    /** POST /chatbot/message — stateless rule-based reply. */
    public function message(Request $request): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'step' => ['nullable'],
            'context' => ['nullable'],
        ]);

        return response()->json($this->chatbot->respond($data['message']));
    }

    /** POST /chatbot/contact — forward a callback/email request to a conseiller. */
    public function contact(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:191'],
            'subject' => ['nullable', 'string', 'max:191'],
            'message' => ['required', 'string', 'max:5000'],
            'pole' => ['nullable', 'string', 'max:60'],
            'channel' => ['nullable', 'in:call_request,email'],
            'dossierId' => ['nullable', 'integer', 'exists:immigration_dossiers,id'],
        ]);

        $contact = ContactRequest::create([
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'subject' => $data['subject'] ?? null,
            'message' => $data['message'],
            'pole' => $data['pole'] ?? null,
            'channel' => $data['channel'] ?? 'call_request',
            'status' => 'nouveau',
            'dossier_id' => $data['dossierId'] ?? null,
        ]);

        // Attach as a dossier message when linked to an existing dossier.
        if ($contact->dossier_id && ($dossier = ImmigrationDossier::find($contact->dossier_id))) {
            DossierMessage::create([
                'dossier_id' => $dossier->id,
                'author_name' => $contact->name,
                'body' => $contact->message,
                'channel' => $contact->channel,
            ]);
        }

        // Notify the academy mailbox (queued).
        Mail::to(config('services.afg.contact_notify_email'))->queue(new ContactRequestReceived($contact));

        return response()->json([
            'message' => 'Votre demande a bien été transmise. Un conseiller vous recontactera sous 24h ouvrées.',
            'contactId' => (string) $contact->id,
        ], 201);
    }
}
