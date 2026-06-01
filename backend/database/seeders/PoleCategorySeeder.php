<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Pole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PoleCategorySeeder extends Seeder
{
    public function run(): void
    {
        // Slugs & labels mirror the frontend src/lib/constants.ts exactly.
        $poles = [
            'soutien-scolaire' => [
                'label' => 'Soutien scolaire',
                'tagline' => 'Accompagnement personnalisé pour réussir au lycée et au collège.',
                'color' => '#1B2A4A',
                'categories' => ['SVT', 'Physique-Chimie', 'Mathématiques', 'Autres'],
            ],
            'formation-continue' => [
                'label' => 'Formation continue',
                'tagline' => 'Développez vos compétences professionnelles à votre rythme.',
                'color' => '#2E4373',
                'categories' => ['Management', 'Marketing', 'Comptabilité', 'Autres'],
            ],
            'immigration' => [
                'label' => 'Immigration',
                'tagline' => 'Étudier, travailler ou s\'installer à l\'étranger sereinement.',
                'color' => '#E8954A',
                'categories' => ['Conseil', 'Préparation de dossiers', 'Contrats à l\'étranger', 'Autres'],
            ],
            'langues' => [
                'label' => 'Langues étrangères',
                'tagline' => 'Ouvrez-vous au monde grâce à des cours interactifs.',
                'color' => '#C9762F',
                'categories' => ['Allemand', 'Anglais', 'Espagnol', 'Chinois', 'Autres'],
            ],
        ];

        foreach ($poles as $slug => $data) {
            $pole = Pole::updateOrCreate(
                ['slug' => $slug],
                ['label' => $data['label'], 'tagline' => $data['tagline'], 'color' => $data['color']],
            );

            foreach ($data['categories'] as $label) {
                Category::updateOrCreate(
                    ['pole_id' => $pole->id, 'slug' => Str::slug($label)],
                    ['label' => $label],
                );
            }
        }
    }
}
