<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->string('title');
            $table->string('type')->default('devoir');   // devoir | examen | quiz
            $table->decimal('max_score', 6, 2)->default(20);
            $table->decimal('weight', 5, 2)->default(1);
            $table->date('date')->nullable();
            $table->timestamps();

            $table->index('formation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
