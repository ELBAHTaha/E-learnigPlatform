<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // --- AFG visioconférence ---
    'meeting' => [
        'default' => env('MEETING_DEFAULT_PROVIDER', 'manual'), // zoom | google_meet | manual
        'manual_base_url' => env('MEETING_MANUAL_BASE_URL', 'https://meet.afg-academie.com'),
    ],

    'zoom' => [
        'account_id' => env('ZOOM_ACCOUNT_ID'),
        'client_id' => env('ZOOM_CLIENT_ID'),
        'client_secret' => env('ZOOM_CLIENT_SECRET'),
    ],

    'google' => [
        'calendar_id' => env('GOOGLE_CALENDAR_ID', 'primary'),
        'service_account_json' => env('GOOGLE_SERVICE_ACCOUNT_JSON'),
    ],

    'afg' => [
        'contact_notify_email' => env('AFG_CONTACT_NOTIFY_EMAIL', 'contact@afg-academie.com'),
    ],

];
