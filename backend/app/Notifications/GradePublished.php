<?php

namespace App\Notifications;

use App\Models\Grade;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class GradePublished extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Grade $grade)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouvelle note — AFG')
            ->greeting('Bonjour '.$notifiable->first_name.',')
            ->line('Une nouvelle note a été publiée : '.$this->grade->label)
            ->line('Note : '.$this->grade->score.' / '.$this->grade->out_of)
            ->line('Consultez votre espace AFG pour le détail.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'grade_published',
            'gradeId' => $this->grade->id,
            'formationId' => $this->grade->formation_id,
            'label' => $this->grade->label,
            'score' => (float) $this->grade->score,
            'outOf' => (float) $this->grade->out_of,
            'message' => 'Nouvelle note : '.$this->grade->label,
        ];
    }
}
