<?php

namespace App\Notifications;

use App\Models\Announcement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewAnnouncement extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Announcement $announcement)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouvelle annonce — AFG')
            ->greeting('Bonjour '.$notifiable->first_name.',')
            ->line($this->announcement->title)
            ->line($this->announcement->body);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'announcement',
            'announcementId' => $this->announcement->id,
            'title' => $this->announcement->title,
            'message' => $this->announcement->title,
        ];
    }
}
