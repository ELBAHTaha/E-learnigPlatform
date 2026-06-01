<?php

namespace App\Notifications;

use App\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EnrollmentDecided extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Enrollment $enrollment)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $approved = $this->enrollment->status === Enrollment::APPROVED;
        $formation = $this->enrollment->formation?->title ?? 'la formation';

        return (new MailMessage)
            ->subject($approved ? 'Inscription approuvée — AFG' : 'Inscription — mise à jour')
            ->greeting('Bonjour '.$notifiable->first_name.',')
            ->line($approved
                ? "Votre inscription à « {$formation} » a été approuvée. Bienvenue !"
                : "Votre demande d'inscription à « {$formation} » n'a pas été retenue.")
            ->line('Connectez-vous à votre espace AFG pour plus de détails.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'enrollment_decided',
            'enrollmentId' => $this->enrollment->id,
            'formationId' => $this->enrollment->formation_id,
            'status' => $this->enrollment->status,
            'message' => 'Décision sur votre inscription : '.$this->enrollment->status,
        ];
    }
}
