<?php

namespace Tests\Feature;

use App\Models\ClassSession;
use App\Models\Enrollment;
use App\Models\Formation;
use App\Models\Pole;
use App\Models\Room;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MeetingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
        config(['services.jitsi.server' => 'https://meet.jit.si']);
    }

    private function makeSession(int $formateurId): ClassSession
    {
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create(['formateur_id' => $formateurId]);

        return ClassSession::create([
            'formation_id' => $formation->id,
            'formateur_id' => $formateurId,
            'room_id' => Room::factory()->create()->id,
            'title' => 'Cours en ligne',
            'starts_at' => '2026-09-01 09:00:00',
            'ends_at' => '2026-09-01 11:00:00',
            'status' => 'scheduled',
        ]);
    }

    public function test_creating_a_meeting_returns_a_jitsi_url(): void
    {
        $formateur = $this->userWithRole('formateur');
        $session = $this->makeSession($formateur->id);
        Sanctum::actingAs($formateur);

        $res = $this->postJson("/api/sessions/{$session->id}/meeting")->assertOk();

        $url = $res->json('meetingUrl');
        $this->assertNotNull($url);
        $this->assertStringStartsWith('https://meet.jit.si/afg-', $url);
        $this->assertTrue($res->json('isOnline'));
    }

    public function test_creating_a_meeting_is_idempotent(): void
    {
        $formateur = $this->userWithRole('formateur');
        $session = $this->makeSession($formateur->id);
        Sanctum::actingAs($formateur);

        $first = $this->postJson("/api/sessions/{$session->id}/meeting")->assertOk()->json('meetingUrl');
        $second = $this->postJson("/api/sessions/{$session->id}/meeting")->assertOk()->json('meetingUrl');

        $this->assertSame($first, $second);
    }

    public function test_formateur_and_eleve_get_the_same_join_url(): void
    {
        $formateur = $this->userWithRole('formateur');
        $eleve = $this->userWithRole('eleve');
        $session = $this->makeSession($formateur->id);

        // Trainer creates the room.
        Sanctum::actingAs($formateur);
        $this->postJson("/api/sessions/{$session->id}/meeting")->assertOk();
        $hostUrl = $this->getJson("/api/sessions/{$session->id}/join")->assertOk()->json('meeting_url');

        // Enroll the student so they may obtain a join link.
        Enrollment::factory()->approved()->create([
            'eleve_id' => $eleve->id,
            'formation_id' => $session->formation_id,
        ]);

        Sanctum::actingAs($eleve);
        $eleveUrl = $this->getJson("/api/sessions/{$session->id}/join")->assertOk()->json('meeting_url');

        $this->assertSame($hostUrl, $eleveUrl);
    }

    public function test_unenrolled_eleve_cannot_get_join_url(): void
    {
        $formateur = $this->userWithRole('formateur');
        $eleve = $this->userWithRole('eleve');
        $session = $this->makeSession($formateur->id);

        Sanctum::actingAs($formateur);
        $this->postJson("/api/sessions/{$session->id}/meeting")->assertOk();

        Sanctum::actingAs($eleve);
        $this->getJson("/api/sessions/{$session->id}/join")->assertForbidden();
    }
}
