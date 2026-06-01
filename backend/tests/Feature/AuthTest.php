<?php

namespace Tests\Feature;

use App\Models\Pole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
    }

    public function test_registration_creates_an_eleve_and_returns_a_token(): void
    {
        Pole::factory()->create(['slug' => 'langues']);

        $response = $this->postJson('/api/auth/register', [
            'firstName' => 'Sara',
            'lastName' => 'Bennani',
            'email' => 'sara@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'interestedPole' => 'langues',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['user' => ['id', 'email', 'firstName', 'lastName', 'role'], 'token'])
            ->assertJsonPath('user.role', 'eleve')
            ->assertJsonPath('user.firstName', 'Sara');

        $this->assertDatabaseHas('users', ['email' => 'sara@example.com']);
    }

    public function test_login_returns_user_and_token(): void
    {
        $user = $this->userWithRole('eleve', ['email' => 'a@b.com', 'password' => Hash::make('secret123')]);

        $this->postJson('/api/auth/login', ['email' => 'a@b.com', 'password' => 'secret123'])
            ->assertOk()
            ->assertJsonPath('user.id', (string) $user->id)
            ->assertJsonStructure(['token']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $this->userWithRole('eleve', ['email' => 'a@b.com', 'password' => Hash::make('secret123')]);

        $this->postJson('/api/auth/login', ['email' => 'a@b.com', 'password' => 'nope'])
            ->assertStatus(422)
            ->assertJsonStructure(['message', 'errors']);
    }

    public function test_suspended_account_cannot_login(): void
    {
        $this->userWithRole('eleve', ['email' => 's@b.com', 'password' => Hash::make('secret123'), 'is_active' => false]);

        $this->postJson('/api/auth/login', ['email' => 's@b.com', 'password' => 'secret123'])
            ->assertStatus(422);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }
}
