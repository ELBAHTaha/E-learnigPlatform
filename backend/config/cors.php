<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Allowed origins are read from the CORS_ALLOWED_ORIGINS env var (a
    | comma-separated list) so the deployed frontend domain(s) can be
    | configured without code changes.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'docs', 'docs/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_map(
        'trim',
        explode(',', (string) env('CORS_ALLOWED_ORIGINS', env('FRONTEND_URL', 'http://localhost:5173')))
    )),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Stateless Bearer-token auth — credentials/cookies are not required.
    'supports_credentials' => false,

];
