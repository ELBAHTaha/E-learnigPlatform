<?php

namespace App\Services\Meeting;

use App\Models\ClassSession;

interface MeetingService
{
    /**
     * Create a meeting for the given session.
     *
     * @return array{provider:string, id:?string, join_url:string, start_url:?string}
     */
    public function createMeeting(ClassSession $session): array;
}
