<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
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

    public function test_database_seeder_does_not_create_sample_properties(): void
    {
        $this->seed();

        $this->assertDatabaseCount('properties', 0);

        $this->getJson('/api/properties')
            ->assertOk()
            ->assertJsonPath('data', [])
            ->assertJsonPath('total', 0)
            ->assertJsonStructure([
                'data',
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

    public function test_seller_images_are_uploaded_to_cloudinary(): void
    {
        $image = UploadedFile::fake()->createWithContent(
            'house.png',
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC')
        );
        config([
            'services.cloudinary.cloud_name' => 'makaanmart-test',
            'services.cloudinary.api_key' => 'test-api-key',
            'services.cloudinary.api_secret' => 'test-api-secret',
            'services.cloudinary.folder' => 'makaanmart/properties',
        ]);
        Http::fake([
            'https://api.cloudinary.com/*' => Http::response([
                'secure_url' => 'https://res.cloudinary.com/makaanmart-test/image/upload/test.jpg',
            ]),
        ]);
        $seller = User::create([
            'name' => 'Seller Account',
            'email' => 'upload-seller@example.test',
            'phone' => '03001234570',
            'role' => 'seller',
            'password' => 'password123',
        ]);

        $this->actingAs($seller, 'sanctum')
            ->post('/api/uploads', [
                'images' => [$image],
            ])
            ->assertCreated()
            ->assertExactJson([
                'images' => ['https://res.cloudinary.com/makaanmart-test/image/upload/test.jpg'],
            ]);

        Http::assertSent(fn ($request): bool => str_contains(
            $request->url(),
            'api.cloudinary.com/v1_1/makaanmart-test/image/upload'
        ));
    }

    public function test_seller_image_upload_fails_explicitly_when_cloudinary_is_unconfigured(): void
    {
        $image = UploadedFile::fake()->createWithContent(
            'house.png',
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC')
        );
        config([
            'services.cloudinary.cloud_name' => null,
            'services.cloudinary.api_key' => null,
            'services.cloudinary.api_secret' => null,
        ]);
        $seller = User::create([
            'name' => 'Seller Account',
            'email' => 'unconfigured-upload-seller@example.test',
            'phone' => '03001234571',
            'role' => 'seller',
            'password' => 'password123',
        ]);

        $this->actingAs($seller, 'sanctum')
            ->post('/api/uploads', [
                'images' => [$image],
            ])
            ->assertServiceUnavailable()
            ->assertExactJson(['error' => 'Image storage is not configured.']);
    }
}
