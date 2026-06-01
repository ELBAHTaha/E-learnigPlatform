<?php

namespace Tests\Feature;

use App\Models\ImmigrationDossier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ImmigrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
    }

    public function test_conseiller_sees_all_dossiers_eleve_sees_own(): void
    {
        $eleve = $this->userWithRole('eleve');
        $otherEleve = $this->userWithRole('eleve');
        ImmigrationDossier::factory()->create(['eleve_id' => $eleve->id]);
        ImmigrationDossier::factory()->create(['eleve_id' => $otherEleve->id]);

        Sanctum::actingAs($this->userWithRole('conseiller'));
        $this->getJson('/api/dossiers')->assertOk()->assertJsonCount(2);

        Sanctum::actingAs($eleve);
        $this->getJson('/api/dossiers')->assertOk()->assertJsonCount(1);
    }

    public function test_conseiller_updates_status_and_notifies_eleve(): void
    {
        Notification::fake();
        $eleve = $this->userWithRole('eleve');
        $dossier = ImmigrationDossier::factory()->create(['eleve_id' => $eleve->id]);
        Sanctum::actingAs($this->userWithRole('conseiller'));

        $this->postJson("/api/dossiers/{$dossier->id}/status", ['status' => 'soumis'])
            ->assertOk()
            ->assertJsonPath('status', 'soumis');

        Notification::assertSentTo($eleve, \App\Notifications\DossierUpdated::class);
    }

    public function test_document_toggle_updates_provided_flag(): void
    {
        $eleve = $this->userWithRole('eleve');
        $dossier = ImmigrationDossier::factory()->create(['eleve_id' => $eleve->id]);
        $doc = $dossier->documents()->create(['name' => 'Passeport', 'is_required' => true, 'provided' => false]);
        Sanctum::actingAs($this->userWithRole('conseiller'));

        $this->patchJson("/api/dossiers/{$dossier->id}/documents/{$doc->id}", ['provided' => true])
            ->assertOk();

        $this->assertDatabaseHas('immigration_documents', ['id' => $doc->id, 'provided' => true, 'status' => 'fourni']);
    }

    public function test_eleve_cannot_change_dossier_status(): void
    {
        $eleve = $this->userWithRole('eleve');
        $dossier = ImmigrationDossier::factory()->create(['eleve_id' => $eleve->id]);
        Sanctum::actingAs($eleve);

        $this->postJson("/api/dossiers/{$dossier->id}/status", ['status' => 'soumis'])->assertForbidden();
    }
}
