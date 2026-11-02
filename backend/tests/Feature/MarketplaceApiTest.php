<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarketplaceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_check_reports_the_active_database_connection(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertExactJson(['status' => 'ok', 'database' => 'sqlite']);
    }

    public function test_api_allows_the_production_frontend_origin(): void
    {
        $this->withHeaders([
            'Origin' => 'https://makaanmart.vercel.app',
            'Access-Control-Request-Method' => 'GET',
        ])->options('/api/health')
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'https://makaanmart.vercel.app');
    }

    public function test_seeded_properties_are_returned_with_frontend_shape(): void
    {
        $this->seed();

        $this->getJson('/api/properties?city=Lahore')
            ->assertOk()
            ->assertJsonPath('data.0.location.city', 'Lahore')
            ->assertJsonStructure([
                'data' => [['id', 'location' => ['city'], 'agent' => ['id']]],
                'total',
                'page',
                'totalPages',
            ]);
    }

    public function test_buyers_cannot_create_property_listings(): void
    {
        $buyer = User::create([
            'name' => 'Buyer Account',
            'email' => 'buyer@example.test',
            'phone' => '03001234567',
            'role' => 'buyer',
            'password' => 'password123',
        ]);

        $this->actingAs($buyer, 'sanctum')
            ->postJson('/api/properties', [])
            ->assertForbidden()
            ->assertJsonPath('error', 'You do not have permission to do that.');
    }

    public function test_registration_returns_a_bearer_token_for_authenticated_requests(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'New Buyer',
            'email' => 'newbuyer@example.test',
            'password' => 'password123',
            'phone' => '03001234569',
            'role' => 'buyer',
        ])->assertCreated();

        $this->withToken($response->json('token'))
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.email', 'newbuyer@example.test')
            ->assertJsonPath('user.role', 'buyer');
    }

    public function test_seller_listings_start_pending_approval(): void
    {
        $seller = User::create([
            'name' => 'Seller Account',
            'email' => 'seller@example.test',
            'phone' => '03001234568',
            'role' => 'seller',
            'password' => 'password123',
        ]);

        $this->actingAs($seller, 'sanctum')
            ->postJson('/api/properties', [
                'title' => 'Modern family home listing',
                'purpose' => 'buy',
                'type' => 'house',
                'price' => 25000000,
                'area' => 5,
                'areaUnit' => 'marla',
                'city' => 'Lahore',
                'areaName' => 'DHA Phase 6',
                'description' => 'A spacious family home close to schools and parks.',
            ])
            ->assertCreated()
            ->assertJsonPath('property.status', 'pending')
            ->assertJsonPath('property.agent.id', $seller->id);
    }
}
