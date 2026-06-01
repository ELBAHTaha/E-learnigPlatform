<?php

namespace Tests\Feature;

use App\Models\Formation;
use App\Models\Pole;
use App\Models\Room;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ScheduleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
    }

    private function makeSession(int $formationId, int $formateurId, int $roomId, string $start, string $end): array
    {
        return [
            'formationId' => $formationId,
            'formateurId' => $formateurId,
            'roomId' => $roomId,
            'title' => 'Cours',
            'start' => $start,
            'end' => $end,
        ];
    }

    public function test_admin_can_create_session(): void
    {
        $admin = $this->userWithRole('admin');
        $formateur = $this->userWithRole('formateur');
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create(['formateur_id' => $formateur->id]);
        $room = Room::factory()->create();
        Sanctum::actingAs($admin);

        $this->postJson('/api/sessions', $this->makeSession(
            $formation->id, $formateur->id, $room->id,
            '2026-09-01T09:00:00Z', '2026-09-01T11:00:00Z'
        ))->assertCreated();
    }

    public function test_overlapping_session_for_same_formateur_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');
        $formateur = $this->userWithRole('formateur');
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create(['formateur_id' => $formateur->id]);
        $roomA = Room::factory()->create();
        $roomB = Room::factory()->create();
        Sanctum::actingAs($admin);

        $this->postJson('/api/sessions', $this->makeSession(
            $formation->id, $formateur->id, $roomA->id,
            '2026-09-01T09:00:00Z', '2026-09-01T11:00:00Z'
        ))->assertCreated();

        // Same trainer, different room, overlapping time -> conflict.
        $this->postJson('/api/sessions', $this->makeSession(
            $formation->id, $formateur->id, $roomB->id,
            '2026-09-01T09:30:00Z', '2026-09-01T10:30:00Z'
        ))->assertStatus(409);
    }

    public function test_overlapping_session_for_same_room_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');
        $formateurA = $this->userWithRole('formateur');
        $formateurB = $this->userWithRole('formateur');
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create(['formateur_id' => $formateurA->id]);
        $room = Room::factory()->create();
        Sanctum::actingAs($admin);

        $this->postJson('/api/sessions', $this->makeSession(
            $formation->id, $formateurA->id, $room->id,
            '2026-09-01T09:00:00Z', '2026-09-01T11:00:00Z'
        ))->assertCreated();

        // Different trainer, same room, overlapping time -> conflict.
        $this->postJson('/api/sessions', $this->makeSession(
            $formation->id, $formateurB->id, $room->id,
            '2026-09-01T10:00:00Z', '2026-09-01T12:00:00Z'
        ))->assertStatus(409);
    }

    public function test_non_overlapping_session_is_allowed(): void
    {
        $admin = $this->userWithRole('admin');
        $formateur = $this->userWithRole('formateur');
        $formation = Formation::factory()->forPole(Pole::factory()->create())->create(['formateur_id' => $formateur->id]);
        $room = Room::factory()->create();
        Sanctum::actingAs($admin);

        $this->postJson('/api/sessions', $this->makeSession(
            $formation->id, $formateur->id, $room->id,
            '2026-09-01T09:00:00Z', '2026-09-01T11:00:00Z'
        ))->assertCreated();

        // Same trainer + room, but a later, non-overlapping slot -> allowed.
        $this->postJson('/api/sessions', $this->makeSession(
            $formation->id, $formateur->id, $room->id,
            '2026-09-01T11:00:00Z', '2026-09-01T13:00:00Z'
        ))->assertCreated();
    }
}
