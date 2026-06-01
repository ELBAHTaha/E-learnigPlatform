<?php

namespace App\Services\Meeting;

use App\Models\ClassSession;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Zoom via Server-to-Server OAuth.
 * Falls back to a manual link if credentials are missing or the API call fails,
 * so the application keeps working without configured keys.
 */
class ZoomMeetingService implements MeetingService
{
    public function __construct(private ManualMeetingService $fallback)
    {
    }

    public function createMeeting(ClassSession $session): array
    {
        $accountId = config('services.zoom.account_id');
        $clientId = config('services.zoom.client_id');
        $clientSecret = config('services.zoom.client_secret');

        if (! $accountId || ! $clientId || ! $clientSecret) {
            return $this->fallback->createMeeting($session);
        }

        try {
            $token = Http::asForm()
                ->withBasicAuth($clientId, $clientSecret)
                ->post('https://zoom.us/oauth/token', [
                    'grant_type' => 'account_credentials',
                    'account_id' => $accountId,
                ])->throw()->json('access_token');

            $meeting = Http::withToken($token)
                ->post('https://api.zoom.us/v2/users/me/meetings', [
                    'topic' => $session->title,
                    'type' => 2, // scheduled
                    'start_time' => $session->starts_at?->toIso8601String(),
                    'duration' => $session->starts_at && $session->ends_at
                        ? $session->starts_at->diffInMinutes($session->ends_at) : 60,
                    'timezone' => config('app.timezone'),
                ])->throw()->json();

            return [
                'provider' => 'zoom',
                'id' => (string) ($meeting['id'] ?? ''),
                'join_url' => $meeting['join_url'],
                'start_url' => $meeting['start_url'] ?? null,
            ];
        } catch (\Throwable $e) {
            Log::warning('Zoom meeting creation failed, falling back to manual link', ['error' => $e->getMessage()]);

            return $this->fallback->createMeeting($session);
        }
    }
}
