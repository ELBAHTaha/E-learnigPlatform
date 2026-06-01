<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Force the application locale to French (the academy's working language),
     * honouring an explicit Accept-Language / X-Locale override when provided.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $supported = ['fr', 'en'];
        $locale = $request->header('X-Locale')
            ?? $request->getPreferredLanguage($supported)
            ?? config('app.locale');

        $locale = substr((string) $locale, 0, 2);
        app()->setLocale(in_array($locale, $supported, true) ? $locale : config('app.locale'));

        return $next($request);
    }
}
