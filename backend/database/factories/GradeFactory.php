<?php

namespace Database\Factories;

use App\Models\Formation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GradeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'eleve_id' => User::factory(),
            'formation_id' => Formation::factory(),
            'label' => fake()->randomElement(['DS 1', 'DS 2', 'Examen']),
            'score' => fake()->numberBetween(8, 20),
            'out_of' => 20,
            'date' => fake()->date(),
        ];
    }
}
