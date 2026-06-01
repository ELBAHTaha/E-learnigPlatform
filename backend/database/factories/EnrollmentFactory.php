<?php

namespace Database\Factories;

use App\Models\Formation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EnrollmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'eleve_id' => User::factory(),
            'formation_id' => Formation::factory(),
            'status' => 'en-attente',
            'progress' => 0,
            'requested_at' => now(),
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => ['status' => 'approuvee', 'decided_at' => now()]);
    }
}
