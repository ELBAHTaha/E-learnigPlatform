<?php

namespace Database\Factories;

use App\Models\Pole;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $label = fake()->unique()->word();

        return [
            'pole_id' => Pole::factory(),
            'slug' => Str::slug($label),
            'label' => ucfirst($label),
        ];
    }
}
