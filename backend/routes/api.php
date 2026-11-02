<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\PropertyController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    DB::connection()->getPdo();

    return response()->json(['status' => 'ok', 'database' => config('database.default')]);
});
Route::get('/stats', [MarketplaceController::class, 'stats']);

Route::middleware('throttle:20,15')->group(function (): void {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);

    Route::get('/inquiries/mine', [MarketplaceController::class, 'myInquiries']);
    Route::get('/favorites', [MarketplaceController::class, 'favorites']);
    Route::put('/favorites', [MarketplaceController::class, 'updateFavorites']);
    Route::get('/saved-searches', [MarketplaceController::class, 'savedSearches']);
    Route::post('/saved-searches', [MarketplaceController::class, 'storeSavedSearch']);
    Route::delete('/saved-searches/{id}', [MarketplaceController::class, 'deleteSavedSearch']);
});

Route::post('/contact', [MarketplaceController::class, 'submitContact']);
Route::post('/inquiries', [MarketplaceController::class, 'submitInquiry']);

Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/featured', [PropertyController::class, 'featured']);
Route::get('/properties/latest', [PropertyController::class, 'latest']);
Route::get('/properties/id/{id}', [PropertyController::class, 'showById']);
Route::get('/properties/slug/{slug}', [PropertyController::class, 'showBySlug']);
Route::get('/properties/{id}/similar', [PropertyController::class, 'similar']);

Route::middleware(['auth:sanctum', 'role:seller,admin'])->group(function (): void {
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::get('/seller/listings', [PropertyController::class, 'sellerListings']);
    Route::patch('/seller/listings/{id}', [PropertyController::class, 'update']);
    Route::delete('/seller/listings/{id}', [PropertyController::class, 'destroy']);
    Route::post('/uploads', [PropertyController::class, 'upload']);
    Route::get('/seller/inquiries', [MarketplaceController::class, 'sellerInquiries']);
    Route::patch('/seller/inquiries/{id}', [MarketplaceController::class, 'updateInquiryStatus']);
});

Route::get('/agents', [MarketplaceController::class, 'agents']);
Route::get('/agents/{id}/listings', [MarketplaceController::class, 'agentListings']);
Route::get('/agents/{id}', [MarketplaceController::class, 'agent']);
Route::get('/cities', [MarketplaceController::class, 'cities']);
Route::get('/blog', [MarketplaceController::class, 'blogPosts']);
Route::get('/blog/{slug}', [MarketplaceController::class, 'blogPost']);

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function (): void {
    Route::get('/summary', [AdminController::class, 'summary']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/contact-messages', [AdminController::class, 'contactMessages']);
    Route::patch('/users/{id}/role', [AdminController::class, 'updateUserRole']);
});
