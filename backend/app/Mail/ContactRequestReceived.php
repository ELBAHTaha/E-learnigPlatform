<?php

namespace App\Mail;

use App\Models\ContactRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactRequestReceived extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public ContactRequest $contact)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nouvelle demande de contact — '.($this->contact->subject ?: 'AFG'),
            replyTo: $this->contact->email ? [$this->contact->email] : [],
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: view()->exists('mail.contact-request')
                ? view('mail.contact-request', ['contact' => $this->contact])->render()
                : $this->inlineBody(),
        );
    }

    private function inlineBody(): string
    {
        $c = $this->contact;
        $rows = [
            'Nom' => $c->name,
            'Téléphone' => $c->phone ?: '—',
            'Email' => $c->email ?: '—',
            'Pôle' => $c->pole ?: '—',
            'Canal' => $c->channel,
            'Sujet' => $c->subject ?: '—',
        ];
        $html = '<h2>Nouvelle demande de contact</h2><ul>';
        foreach ($rows as $k => $v) {
            $html .= '<li><strong>'.e($k).' :</strong> '.e($v).'</li>';
        }
        $html .= '</ul><p><strong>Message :</strong></p><p>'.nl2br(e($c->message)).'</p>';

        return $html;
    }
}
