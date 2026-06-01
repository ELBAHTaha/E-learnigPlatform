<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Pole;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class FormationFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->sentence(3);

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1, 99999),
            'pole_id' => Pole::factory(),
            'category_id' => null,
            'description' => fake()->paragraph(),
            'level' => fake()->randomElement(['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux']),
            'modality' => fake()->randomElement(['Présentiel', 'À distance', 'Hybride']),
            'duration' => fake()->randomElement(['8 semaines', '6 mois', 'Variable']),
            'price' => fake()->numberBetween(2000, 12000),
            'currency' => 'MAD',
            'capacity' => fake()->numberBetween(10, 40),
            'is_active' => true,
        ];
    }

    public function forPole(Pole $pole): static
    {
        return $this->state(fn () => [
            'pole_id' => $pole->id,
            'category_id' => Category::factory()->state(['pole_id' => $pole->id]),
        ]);
    }
}
