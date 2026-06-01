<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ImmigrationDossierFactory extends Factory
{
    public function definition(): array
    {
        return [
            'eleve_id' => User::factory(),
            'conseiller_id' => null,
            'type' => 'preparation-dossier',
            'destination_country' => fake()->randomElement(['Canada', 'Allemagne', 'France']),
            'program_type' => 'Visa étudiant',
            'status' => 'nouveau',
            'opened_at' => now(),
        ];
    }
}
