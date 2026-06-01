<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Formation;
use App\Models\Pole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FormationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
    }

    public function test_formations_list_is_public_and_filterable_by_pole(): void
    {
        $langues = Pole::factory()->create(['slug' => 'langues']);
        $soutien = Pole::factory()->create(['slug' => 'soutien-scolaire']);
        Formation::factory()->forPole($langues)->create();
        Formation::factory()->forPole($soutien)->create();

        $this->getJson('/api/formations')->assertOk()->assertJsonCount(2);
        $this->getJson('/api/formations?pole=langues')->assertOk()->assertJsonCount(1);
    }

    public function test_formation_can_be_shown_by_id_and_slug(): void
    {
        $pole = Pole::factory()->create();
        $formation = Formation::factory()->forPole($pole)->create(['slug' => 'mon-cours']);

        $this->getJson("/api/formations/{$formation->id}")->assertOk()->assertJsonPath('id', (string) $formation->id);
        $this->getJson('/api/formations/mon-cours')->assertOk()->assertJsonPath('slug', 'mon-cours');
    }

    public function test_admin_can_create_formation_resolving_pole_and_subcategory(): void
    {
        $pole = Pole::factory()->create(['slug' => 'langues']);
        Category::factory()->create(['pole_id' => $pole->id, 'label' => 'Anglais']);
        Sanctum::actingAs($this->userWithRole('admin'));

        $this->postJson('/api/formations', [
            'title' => 'Anglais intensif',
            'pole' => 'langues',
            'subcategory' => 'Anglais',
            'level' => 'Débutant',
            'description' => 'Cours intensif',
            'price' => 4200,
            'capacity' => 20,
        ])->assertCreated()
            ->assertJsonPath('pole', 'langues')
            ->assertJsonPath('subcategory', 'Anglais')
            ->assertJsonPath('price', 4200);
    }

    public function test_eleve_cannot_create_formation(): void
    {
        Pole::factory()->create(['slug' => 'langues']);
        Sanctum::actingAs($this->userWithRole('eleve'));

        $this->postJson('/api/formations', [
            'title' => 'X', 'pole' => 'langues', 'level' => 'Débutant',
            'description' => 'x', 'price' => 1, 'capacity' => 1,
        ])->assertForbidden();
    }
}
