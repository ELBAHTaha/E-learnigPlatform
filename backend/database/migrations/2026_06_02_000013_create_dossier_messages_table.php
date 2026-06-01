<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dossier_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('immigration_dossiers')->cascadeOnDelete();
            $table->foreignId('sender_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('author_name')->nullable();   // display label for the note author
            $table->text('body');
            $table->string('channel')->default('note');  // note | email | call_request
            $table->timestamps();

            $table->index('dossier_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dossier_messages');
    }
};
