<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('eleve_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('assessment_id')->nullable()->constrained('assessments')->nullOnDelete();
            $table->string('label');                  // e.g. "DS 1 — Suites"
            $table->decimal('score', 7, 2);
            $table->decimal('out_of', 7, 2)->default(20);
            $table->date('date')->nullable();
            $table->text('comment')->nullable();
            $table->foreignId('entered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['eleve_id', 'formation_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
