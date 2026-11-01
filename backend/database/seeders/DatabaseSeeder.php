<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\User;
use App\Support\MarketFixtures;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach (MarketFixtures::all()['properties'] as $fixture) {
            Property::updateOrCreate(
                ['id' => $fixture['id']],
                [
                    'slug' => $fixture['slug'],
                    'owner_id' => null,
                    'title' => $fixture['title'],
                    'purpose' => $fixture['purpose'],
                    'type' => $fixture['type'],
                    'status' => $fixture['status'],
                    'price' => $fixture['price'],
                    'price_unit' => $fixture['priceUnit'] ?? null,
                    'area' => $fixture['area'],
                    'area_unit' => $fixture['areaUnit'],
                    'bedrooms' => $fixture['bedrooms'] ?? null,
                    'bathrooms' => $fixture['bathrooms'] ?? null,
                    'floors' => $fixture['floors'] ?? null,
                    'parking_spaces' => $fixture['parkingSpaces'] ?? null,
                    'furnished' => $fixture['furnished'] ?? null,
                    'location' => $fixture['location'],
                    'description' => $fixture['description'],
                    'amenities' => $fixture['amenities'],
                    'images' => $fixture['images'],
                    'video_url' => $fixture['videoUrl'] ?? null,
                    'floor_plan_url' => $fixture['floorPlanUrl'] ?? null,
                    'agent_data' => $fixture['agent'],
                    'featured' => $fixture['featured'],
                    'premium' => $fixture['premium'],
                    'verified' => $fixture['verified'],
                    'price_drop' => $fixture['priceDrop'] ?? null,
                    'views' => $fixture['views'],
                    'posted_at' => Carbon::parse($fixture['postedAt']),
                ]
            );
        }

        $email = trim((string) env('ADMIN_EMAIL'));
        $password = (string) env('ADMIN_PASSWORD');
        if ($email !== '' && $password !== '') {
            User::firstOrCreate(
                ['email' => mb_strtolower($email)],
                [
                    'name' => env('ADMIN_NAME', 'Administrator'),
                    'phone' => env('ADMIN_PHONE', '0000000000'),
                    'role' => 'admin',
                    'verified' => true,
                    'password' => $password,
                ]
            );
        }
    }
}
