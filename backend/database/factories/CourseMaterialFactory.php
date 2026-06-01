<?php

namespace Database\Factories;

use App\Models\Formation;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseMaterialFactory extends Factory
{
    public function definition(): array
    {
        $type = fake()->randomElement(['cours', 'exercice', 'corrige', 'video']);

        return [
            'formation_id' => Formation::factory(),
            'type' => $type,
            'title' => fake()->sentence(3),
            'disk' => $type === 'corrige' ? 'private' : 'public',
            'file_path' => 'materials/sample.pdf',
            'original_filename' => 'sample.pdf',
            'file_size' => 1024 * 1024,
            'order' => 0,
        ];
    }

    public function corrige(): static
    {
        return $this->state(fn () => ['type' => 'corrige', 'disk' => 'private']);
    }
}
