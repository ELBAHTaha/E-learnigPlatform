<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Switch visioconférence from Zoom/Google Meet to Jitsi Meet.
     * Jitsi needs no host/guest distinction and no provider switch, so the
     * meeting_host_url and meeting_provider columns are no longer needed.
     * meeting_url keeps the full room URL; meeting_id keeps the room name/slug.
     */
    public function up(): void
    {
        Schema::table('class_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('class_sessions', 'meeting_host_url')) {
                $table->dropColumn('meeting_host_url');
            }
            if (Schema::hasColumn('class_sessions', 'meeting_provider')) {
                $table->dropColumn('meeting_provider');
            }
        });
    }

    public function down(): void
    {
        Schema::table('class_sessions', function (Blueprint $table) {
            $table->string('meeting_provider')->nullable()->after('is_online');
            $table->string('meeting_host_url')->nullable()->after('meeting_id');
        });
    }
};
