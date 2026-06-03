<?php

namespace App\Providers;

use App\Services\Meeting\JitsiMeetingService;
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
        // Visioconférence is Jitsi Meet — no provider switch, no credentials.
        $this->app->singleton(JitsiMeetingService::class);
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
