<?php

namespace App\Services\Meeting;

use App\Models\ClassSession;
use Illuminate\Support\Str;

/**
 * Jitsi Meet visioconférence.
 *
 * No external API, no OAuth, no queue: the room URL is built deterministically
 * from the session. Every participant (trainer or student) uses the same URL —
 * Jitsi has no host vs. guest link distinction.
 */
class JitsiMeetingService
{
    /**
     * Jitsi server base URL (public meet.jit.si by default, or a self-hosted
     * instance via JITSI_SERVER in .env).
     */
    protected string $server;

    public function __construct()
    {
        $this->server = rtrim((string) config('services.jitsi.server', 'https://meet.jit.si'), '/');
    }

    /**
     * Generate a Jitsi room for the session and persist it. Idempotent:
     * an existing room is left untouched.
     */
    public function createMeeting(ClassSession $session): ClassSession
    {
        if ($session->meeting_url) {
            return $session;
        }

        // URL-safe, collision-free room name: afg-{formation-slug}-{session-id}.
        $base = Str::slug($session->formation->title ?? $session->title ?? 'session');
        $roomName = "afg-{$base}-{$session->id}";

        $session->update([
            'meeting_id' => $roomName,
            'meeting_url' => "{$this->server}/{$roomName}",
            'is_online' => true,
        ]);

        return $session->fresh();
    }

    /**
     * All participants share the same URL.
     * (A JWT could be appended here later for private/moderated rooms.)
     */
    public function getJoinUrl(ClassSession $session): ?string
    {
        return $session->meeting_url;
    }
}
