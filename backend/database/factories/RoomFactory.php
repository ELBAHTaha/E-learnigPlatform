<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RoomFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => 'Salle '.fake()->unique()->bothify('?#'),
            'capacity' => fake()->numberBetween(10, 80),
            'building' => fake()->randomElement(['Bâtiment A', 'Bâtiment B']),
            'equipment' => ['Vidéoprojecteur'],
            'is_active' => true,
        ];
    }
}
