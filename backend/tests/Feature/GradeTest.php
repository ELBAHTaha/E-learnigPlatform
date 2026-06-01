<?php

namespace Tests\Feature;

use App\Models\Formation;
use App\Models\Grade;
use App\Models\Pole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GradeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
    }

    public function test_formateur_can_enter_grade_for_own_formation(): void
    {
        Notification::fake();
        $formateur = $this->userWithRole('formateur');
        $eleve = $this->userWithRole('eleve');
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create(['formateur_id' => $formateur->id]);
        Sanctum::actingAs($formateur);

        $this->postJson('/api/grades', [
            'eleveId' => $eleve->id,
            'formationId' => $formation->id,
            'assessment' => 'DS 1',
            'score' => 15,
            'outOf' => 20,
        ])->assertCreated()->assertJsonPath('assessment', 'DS 1')->assertJsonPath('score', 15);

        Notification::assertSentTo($eleve, \App\Notifications\GradePublished::class);
    }

    public function test_formateur_cannot_grade_other_formation(): void
    {
        $formateur = $this->userWithRole('formateur');
        $eleve = $this->userWithRole('eleve');
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create(['formateur_id' => null]);
        Sanctum::actingAs($formateur);

        $this->postJson('/api/grades', [
            'eleveId' => $eleve->id, 'formationId' => $formation->id,
            'assessment' => 'DS', 'score' => 15, 'outOf' => 20,
        ])->assertForbidden();
    }

    public function test_eleve_sees_only_own_grades(): void
    {
        $eleve = $this->userWithRole('eleve');
        $other = $this->userWithRole('eleve');
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create();
        Grade::factory()->count(2)->create(['eleve_id' => $eleve->id, 'formation_id' => $formation->id]);
        Grade::factory()->create(['eleve_id' => $other->id, 'formation_id' => $formation->id]);
        Sanctum::actingAs($eleve);

        $this->getJson('/api/grades')->assertOk()->assertJsonCount(2);
    }

    public function test_me_grades_returns_computed_averages(): void
    {
        $eleve = $this->userWithRole('eleve');
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create();
        Grade::factory()->create(['eleve_id' => $eleve->id, 'formation_id' => $formation->id, 'score' => 10, 'out_of' => 20]);
        Grade::factory()->create(['eleve_id' => $eleve->id, 'formation_id' => $formation->id, 'score' => 20, 'out_of' => 20]);
        Sanctum::actingAs($eleve);

        $this->getJson('/api/me/grades')
            ->assertOk()
            ->assertJsonStructure(['grades', 'byFormation', 'overallAverage'])
            ->assertJsonPath('byFormation.0.average', 15);
    }
}
