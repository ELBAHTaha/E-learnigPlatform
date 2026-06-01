<?php

namespace Tests\Feature;

use App\Models\CourseMaterial;
use App\Models\Enrollment;
use App\Models\Formation;
use App\Models\Pole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MaterialAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
        Storage::fake('private');
        Storage::fake('public');
    }

    private function corrige(): CourseMaterial
    {
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create();
        Storage::disk('private')->put('materials/c.pdf', 'secret');

        return CourseMaterial::factory()->corrige()->create([
            'formation_id' => $formation->id,
            'file_path' => 'materials/c.pdf',
        ]);
    }

    public function test_enrolled_eleve_can_download_corrige(): void
    {
        $material = $this->corrige();
        $eleve = $this->userWithRole('eleve');
        Enrollment::factory()->approved()->create([
            'eleve_id' => $eleve->id, 'formation_id' => $material->formation_id,
        ]);
        Sanctum::actingAs($eleve);

        $this->get("/api/materials/{$material->id}/download")->assertOk();
    }

    public function test_non_enrolled_eleve_cannot_download_corrige(): void
    {
        $material = $this->corrige();
        Sanctum::actingAs($this->userWithRole('eleve'));

        $this->getJson("/api/materials/{$material->id}/download")->assertForbidden();
    }

    public function test_owning_formateur_can_download_corrige(): void
    {
        $material = $this->corrige();
        $formateur = $this->userWithRole('formateur');
        $material->formation->update(['formateur_id' => $formateur->id]);
        Sanctum::actingAs($formateur);

        $this->get("/api/materials/{$material->id}/download")->assertOk();
    }
}
