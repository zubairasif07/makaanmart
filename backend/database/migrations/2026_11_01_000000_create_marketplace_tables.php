<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table): void {
            $table->string('id', 64)->primary();
            $table->string('slug')->unique();
            $table->uuid('owner_id')->nullable()->index();
            $table->string('title');
            $table->string('purpose', 20)->index();
            $table->string('type', 30)->index();
            $table->string('status', 20)->index();
            $table->decimal('price', 16, 2);
            $table->string('price_unit')->nullable();
            $table->decimal('area', 12, 2);
            $table->string('area_unit', 20);
            $table->unsignedSmallInteger('bedrooms')->nullable();
            $table->unsignedSmallInteger('bathrooms')->nullable();
            $table->unsignedSmallInteger('floors')->nullable();
            $table->unsignedSmallInteger('parking_spaces')->nullable();
            $table->string('furnished', 30)->nullable();
            $table->json('location');
            $table->text('description');
            $table->json('amenities');
            $table->json('images');
            $table->string('video_url', 2048)->nullable();
            $table->string('floor_plan_url', 2048)->nullable();
            $table->json('agent_data')->nullable();
            $table->boolean('featured')->default(false);
            $table->boolean('premium')->default(false);
            $table->boolean('verified')->default(false);
            $table->decimal('price_drop', 5, 2)->nullable();
            $table->unsignedInteger('views')->default(0);
            $table->timestamp('posted_at')->index();
            $table->timestamps();

            $table->foreign('owner_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('inquiries', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('property_id', 64)->index();
            $table->uuid('buyer_id')->nullable()->index();
            $table->string('buyer_name');
            $table->string('buyer_email');
            $table->string('buyer_phone', 40);
            $table->text('message');
            $table->string('type', 20);
            $table->string('status', 20)->default('new')->index();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('property_id')->references('id')->on('properties')->cascadeOnDelete();
            $table->foreign('buyer_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('favorites', function (Blueprint $table): void {
            $table->uuid('user_id');
            $table->string('property_id', 64);
            $table->timestamp('created_at')->useCurrent();
            $table->primary(['user_id', 'property_id']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('property_id')->references('id')->on('properties')->cascadeOnDelete();
        });

        Schema::create('saved_searches', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->index();
            $table->string('name', 100);
            $table->json('filters');
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('contact_messages', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email');
            $table->string('phone', 40)->default('');
            $table->string('subject', 160);
            $table->text('message');
            $table->timestamps();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table): void {
            $table->id();
            $table->uuidMorphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('saved_searches');
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('inquiries');
        Schema::dropIfExists('properties');
    }
};
