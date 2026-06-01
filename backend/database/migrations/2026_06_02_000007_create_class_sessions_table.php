<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Domain "séances" / emploi du temps. Named class_sessions to avoid any
        // collision with Laravel's HTTP session storage.
        Schema::create('class_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('formateur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('room_id')->nullable()->constrained('rooms')->nullOnDelete();
            $table->string('title');
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->string('recurrence')->default('none');     // none | weekly
            $table->json('recurrence_days')->nullable();
            $table->boolean('is_online')->default(false);
            $table->string('meeting_provider')->nullable();    // zoom | google_meet | manual
            $table->string('meeting_url')->nullable();         // join url (sent to students)
            $table->string('meeting_id')->nullable();
            $table->string('meeting_host_url')->nullable();    // start url (private to host)
            $table->string('status')->default('scheduled');    // scheduled | cancelled | done
            $table->timestamps();

            $table->index(['formation_id', 'starts_at']);
            $table->index(['formateur_id', 'starts_at']);
            $table->index(['room_id', 'starts_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_sessions');
    }
};
