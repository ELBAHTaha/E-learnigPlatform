<?php

namespace App\Notifications;

use App\Models\ImmigrationDossier;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DossierUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public ImmigrationDossier $dossier, public string $summary)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Mise à jour de votre dossier d\'immigration — AFG')
            ->greeting('Bonjour '.$notifiable->first_name.',')
            ->line($this->summary)
            ->line('Destination : '.$this->dossier->destination_country)
            ->line('Statut actuel : '.$this->dossier->status);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'dossier_updated',
            'dossierId' => $this->dossier->id,
            'status' => $this->dossier->status,
            'message' => $this->summary,
        ];
    }
}
