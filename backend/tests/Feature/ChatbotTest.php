<?php

namespace Tests\Feature;

use App\Mail\ContactRequestReceived;
use App\Models\Category;
use App\Models\Formation;
use App\Models\Pole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ChatbotTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
    }

    public function test_greeting_returns_menu_quick_replies(): void
    {
        $this->postJson('/api/chatbot/message', ['message' => 'bonjour'])
            ->assertOk()
            ->assertJsonStructure(['reply', 'quickReplies' => [['label', 'payload']]]);
    }

    public function test_price_intent_lists_pole_tarifs_from_live_data(): void
    {
        $pole = Pole::factory()->create(['slug' => 'langues', 'label' => 'Langues étrangères']);
        Category::factory()->create(['pole_id' => $pole->id, 'label' => 'Anglais']);
        Formation::factory()->forPole($pole)->create(['title' => 'Anglais TOEIC', 'price' => 5200]);

        $response = $this->postJson('/api/chatbot/message', ['message' => 'combien coûte anglais'])
            ->assertOk();

        $this->assertStringContainsString('Anglais TOEIC', $response->json('reply'));
        $this->assertStringContainsString('5 200 MAD', $response->json('reply'));
    }

    public function test_menu_payload_navigation_works(): void
    {
        $this->postJson('/api/chatbot/message', ['message' => 'menu:contact'])
            ->assertOk()
            ->assertJsonPath('payload.action', 'contact');
    }

    public function test_contact_creates_request_and_queues_email(): void
    {
        Mail::fake();

        $this->postJson('/api/chatbot/contact', [
            'name' => 'Visiteur Test',
            'phone' => '+212600000000',
            'message' => 'Merci de me rappeler',
            'pole' => 'immigration',
        ])->assertCreated()->assertJsonStructure(['message', 'contactId']);

        $this->assertDatabaseHas('contact_requests', ['name' => 'Visiteur Test', 'pole' => 'immigration']);
        Mail::assertQueued(ContactRequestReceived::class);
    }
}
