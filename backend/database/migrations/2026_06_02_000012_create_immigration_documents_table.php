<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('immigration_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('immigration_dossiers')->cascadeOnDelete();
            $table->string('name');
            $table->boolean('is_required')->default(true);
            $table->boolean('provided')->default(false);
            $table->string('status')->default('a_fournir');  // a_fournir | fourni | valide | refuse
            $table->string('disk')->default('private');
            $table->string('file_path')->nullable();
            $table->string('original_filename')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('dossier_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('immigration_documents');
    }
};
