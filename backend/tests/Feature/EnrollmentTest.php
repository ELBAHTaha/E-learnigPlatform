<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\Formation;
use App\Models\Pole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EnrollmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
    }

    public function test_eleve_can_request_enrollment(): void
    {
        $eleve = $this->userWithRole('eleve');
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create();
        Sanctum::actingAs($eleve);

        $this->postJson('/api/enrollments', ['formationId' => $formation->id])
            ->assertCreated()
            ->assertJsonPath('status', 'en-attente')
            ->assertJsonPath('eleveId', (string) $eleve->id);
    }

    public function test_duplicate_enrollment_returns_conflict(): void
    {
        $eleve = $this->userWithRole('eleve');
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create();
        Enrollment::factory()->create(['eleve_id' => $eleve->id, 'formation_id' => $formation->id]);
        Sanctum::actingAs($eleve);

        $this->postJson('/api/enrollments', ['formationId' => $formation->id])->assertStatus(409);
    }

    public function test_eleve_only_sees_own_enrollments(): void
    {
        $eleve = $this->userWithRole('eleve');
        $other = $this->userWithRole('eleve');
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create();
        Enrollment::factory()->create(['eleve_id' => $eleve->id, 'formation_id' => $formation->id]);
        Enrollment::factory()->create(['eleve_id' => $other->id, 'formation_id' => $formation->id]);
        Sanctum::actingAs($eleve);

        $this->getJson('/api/enrollments')->assertOk()->assertJsonCount(1);
    }

    public function test_admin_decides_enrollment_and_notifies_eleve(): void
    {
        Notification::fake();
        $eleve = $this->userWithRole('eleve');
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create();
        $enrollment = Enrollment::factory()->create(['eleve_id' => $eleve->id, 'formation_id' => $formation->id]);
        Sanctum::actingAs($this->userWithRole('admin'));

        $this->postJson("/api/enrollments/{$enrollment->id}/decide", ['status' => 'approuvee'])
            ->assertOk()
            ->assertJsonPath('status', 'approuvee');

        Notification::assertSentTo($eleve, \App\Notifications\EnrollmentDecided::class);
    }

    public function test_eleve_cannot_decide_enrollment(): void
    {
        $eleve = $this->userWithRole('eleve');
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create();
        $enrollment = Enrollment::factory()->create(['eleve_id' => $eleve->id, 'formation_id' => $formation->id]);
        Sanctum::actingAs($eleve);

        $this->postJson("/api/enrollments/{$enrollment->id}/decide", ['status' => 'approuvee'])->assertForbidden();
    }
}
