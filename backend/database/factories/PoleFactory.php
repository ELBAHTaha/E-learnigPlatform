<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PoleFactory extends Factory
{
    public function definition(): array
    {
        $label = fake()->unique()->words(2, true);

        return [
            'slug' => Str::slug($label),
            'label' => ucfirst($label),
            'tagline' => fake()->sentence(),
            'color' => fake()->hexColor(),
        ];
    }
}
