<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
    }

    public function test_eleve_cannot_list_users(): void
    {
        Sanctum::actingAs($this->userWithRole('eleve'));
        $this->getJson('/api/users')->assertForbidden();
    }

    public function test_admin_can_list_users(): void
    {
        Sanctum::actingAs($this->userWithRole('admin'));
        $this->getJson('/api/users')->assertOk();
    }

    public function test_eleve_cannot_view_stats(): void
    {
        Sanctum::actingAs($this->userWithRole('eleve'));
        $this->getJson('/api/stats/overview')->assertForbidden();
    }

    public function test_admin_can_view_stats(): void
    {
        Sanctum::actingAs($this->userWithRole('admin'));
        $this->getJson('/api/stats/overview')
            ->assertOk()
            ->assertJsonStructure(['counts', 'series']);
    }

    public function test_conseiller_cannot_create_formation(): void
    {
        Sanctum::actingAs($this->userWithRole('conseiller'));
        $this->postJson('/api/formations', [])->assertForbidden();
    }
}
