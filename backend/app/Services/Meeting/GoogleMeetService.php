<?php

namespace App\Services\Meeting;

use App\Models\ClassSession;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Google Meet via a Google Calendar event with conferenceData.
 * Requires a service-account JSON (path in GOOGLE_SERVICE_ACCOUNT_JSON).
 * Falls back to a manual link when not configured or on failure.
 */
class GoogleMeetService implements MeetingService
{
    public function __construct(private ManualMeetingService $fallback)
    {
    }

    public function createMeeting(ClassSession $session): array
    {
        $credentialsPath = config('services.google.service_account_json');

        if (! $credentialsPath || ! is_file($credentialsPath)) {
            return $this->fallback->createMeeting($session);
        }

        try {
            $token = $this->accessToken($credentialsPath);
            $calendarId = config('services.google.calendar_id', 'primary');

            $event = Http::withToken($token)
                ->post("https://www.googleapis.com/calendar/v3/calendars/{$calendarId}/events?conferenceDataVersion=1", [
                    'summary' => $session->title,
                    'start' => ['dateTime' => $session->starts_at?->toIso8601String(), 'timeZone' => config('app.timezone')],
                    'end' => ['dateTime' => $session->ends_at?->toIso8601String(), 'timeZone' => config('app.timezone')],
                    'conferenceData' => [
                        'createRequest' => [
                            'requestId' => (string) Str::uuid(),
                            'conferenceSolutionKey' => ['type' => 'hangoutsMeet'],
                        ],
                    ],
                ])->throw()->json();

            $joinUrl = $event['hangoutLink'] ?? ($event['conferenceData']['entryPoints'][0]['uri'] ?? null);

            return [
                'provider' => 'google_meet',
                'id' => $event['id'] ?? null,
                'join_url' => $joinUrl ?? $this->fallback->createMeeting($session)['join_url'],
                'start_url' => $joinUrl,
            ];
        } catch (\Throwable $e) {
            Log::warning('Google Meet creation failed, falling back to manual link', ['error' => $e->getMessage()]);

            return $this->fallback->createMeeting($session);
        }
    }

    /** Exchange the service-account JWT for an OAuth access token. */
    private function accessToken(string $credentialsPath): string
    {
        $creds = json_decode((string) file_get_contents($credentialsPath), true);
        $now = time();

        $jwt = $this->jwt(
            ['alg' => 'RS256', 'typ' => 'JWT'],
            [
                'iss' => $creds['client_email'],
                'scope' => 'https://www.googleapis.com/auth/calendar.events',
                'aud' => 'https://oauth2.googleapis.com/token',
                'iat' => $now,
                'exp' => $now + 3600,
            ],
            $creds['private_key'],
        );

        return Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt,
        ])->throw()->json('access_token');
    }

    private function jwt(array $header, array $claims, string $privateKey): string
    {
        $segments = [
            $this->b64(json_encode($header)),
            $this->b64(json_encode($claims)),
        ];
        $signingInput = implode('.', $segments);
        openssl_sign($signingInput, $signature, $privateKey, 'sha256WithRSAEncryption');

        return $signingInput.'.'.$this->b64($signature);
    }

    private function b64(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
