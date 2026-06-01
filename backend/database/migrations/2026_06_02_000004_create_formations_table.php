<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('formations', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->foreignId('pole_id')->constrained('poles')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->text('description');
            $table->text('long_description')->nullable();
            $table->string('level');                                  // Débutant | Intermédiaire | Avancé | Tous niveaux
            $table->string('modality')->nullable();                   // Présentiel | À distance | Hybride
            $table->string('duration')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('currency', 8)->default('MAD');
            $table->json('payment_options')->nullable();
            $table->string('schedule')->nullable();
            $table->unsignedInteger('capacity')->default(0);
            $table->decimal('rating', 3, 1)->nullable();
            $table->json('highlights')->nullable();
            $table->json('documents_required')->nullable();
            $table->string('image_color', 16)->nullable();
            $table->string('cover_image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('formateur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['pole_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formations');
    }
};
