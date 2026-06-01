<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('immigration_dossiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('eleve_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('conseiller_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type')->nullable();              // conseil | preparation-dossier | contrat-etranger
            $table->string('destination_country');           // e.g. "Canada"
            $table->string('program_type')->nullable();      // e.g. "Permis d'études"
            // nouveau | en-cours | documents-requis | soumis | finalise | rejete
            $table->string('status')->default('nouveau');
            $table->text('notes')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamps();

            $table->index(['eleve_id', 'conseiller_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('immigration_dossiers');
    }
};
