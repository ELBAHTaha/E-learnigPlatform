<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Chatbot "Prise de contact" / callback requests (may be anonymous).
        Schema::create('contact_requests', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('subject')->nullable();
            $table->text('message');
            $table->string('pole')->nullable();
            $table->string('channel')->default('call_request'); // call_request | email
            $table->string('status')->default('nouveau');       // nouveau | traite
            $table->foreignId('dossier_id')->nullable()->constrained('immigration_dossiers')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_requests');
    }
};
