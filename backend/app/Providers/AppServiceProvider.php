<?php

namespace App\Providers;

use App\Services\Meeting\GoogleMeetService;
use App\Services\Meeting\ManualMeetingService;
use App\Services\Meeting\MeetingService;
use App\Services\Meeting\ZoomMeetingService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind the meeting provider selected by config (zoom | google_meet | manual).
        $this->app->bind(MeetingService::class, function ($app) {
            return match (config('services.meeting.default')) {
                'zoom' => $app->make(ZoomMeetingService::class),
                'google_meet' => $app->make(GoogleMeetService::class),
                default => $app->make(ManualMeetingService::class),
            };
        });
    }

    public function boot(): void
    {
        // The React SPA consumes bare JSON objects/arrays (no "data" envelope),
        // so the API can be a drop-in replacement for the mock layer.
        JsonResource::withoutWrapping();

        // Admins bypass all policy checks.
        Gate::before(function ($user, $ability) {
            return $user->hasRole('admin') ? true : null;
        });

        // Rate limiters.
        RateLimiter::for('api', fn (Request $r) => Limit::perMinute(120)->by($r->user()?->id ?: $r->ip()));
        RateLimiter::for('auth', fn (Request $r) => Limit::perMinute(10)->by($r->ip()));
        RateLimiter::for('chatbot', fn (Request $r) => Limit::perMinute(30)->by($r->user()?->id ?: $r->ip()));
    }
}
