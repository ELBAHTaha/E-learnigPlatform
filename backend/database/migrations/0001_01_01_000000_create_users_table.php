<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone')->nullable();
            $table->string('city')->nullable();
            $table->string('avatar_path')->nullable();
            $table->string('locale', 5)->default('fr');
            $table->boolean('is_active')->default(true);

            // Role-specific profile fields (kept on the single users table)
            $table->text('bio')->nullable();                // formateur
            $table->json('specialties')->nullable();        // formateur
            $table->json('territories')->nullable();        // conseiller
            $table->string('level')->nullable();            // eleve
            $table->string('interested_pole')->nullable();  // eleve

            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // NOTE: the HTTP session table is intentionally omitted — this is a
        // stateless token API (SESSION_DRIVER=file). The domain "séances"
        // live in the `class_sessions` table to avoid any naming collision.
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
    }
};
