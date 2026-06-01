<?php

namespace App\Services\Meeting;

use App\Models\ClassSession;
use Illuminate\Support\Str;

/**
 * Fallback "provider" used when no Zoom/Google credentials are configured.
 * Generates a deterministic manual meeting link so the app is fully functional
 * during development without any third-party keys.
 */
class ManualMeetingService implements MeetingService
{
    public function createMeeting(ClassSession $session): array
    {
        $base = rtrim((string) config('services.meeting.manual_base_url'), '/');
        $slug = Str::slug($session->title.'-'.$session->id).'-'.Str::random(6);
        $url = $base.'/'.$slug;

        return [
            'provider' => 'manual',
            'id' => $slug,
            'join_url' => $url,
            'start_url' => $url.'?host=1',
        ];
    }
}
