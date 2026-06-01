<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('uploader_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type');                          // cours | exercice | corrige | video
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('disk')->default('public');       // 'public' or 'private' (corrigés)
            $table->string('file_path')->nullable();
            $table->string('original_filename')->nullable();
            $table->unsignedBigInteger('file_size')->nullable(); // bytes
            $table->string('external_video_url')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index(['formation_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_materials');
    }
};
