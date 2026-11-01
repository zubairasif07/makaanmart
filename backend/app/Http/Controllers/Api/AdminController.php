<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function summary(): JsonResponse
    {
        return response()->json([
            'listings' => Property::query()->count(),
            'pendingListings' => Property::query()->where('status', 'pending')->count(),
            'users' => User::query()->count(),
            'agents' => User::query()->whereIn('role', ['seller', 'admin'])->count(),
            'inquiries' => Inquiry::query()->where('status', 'new')->count(),
        ]);
    }

    public function users(): JsonResponse
    {
        return response()->json(
            User::query()->orderByDesc('created_at')->get()->map(fn (User $user): array => $user->toApiArray())
        );
    }

    public function contactMessages(): JsonResponse
    {
        return response()->json(
            ContactMessage::query()->orderByDesc('created_at')->limit(200)->get()
                ->map(fn (ContactMessage $message): array => $message->toApiArray())
        );
    }

    public function updateUserRole(Request $request, string $id): JsonResponse
    {
        $data = $request->validate(['role' => ['required', Rule::in(['buyer', 'seller'])]]);
        $user = User::query()->where('id', $id)->where('role', '!=', 'admin')->first();
        if (! $user) {
            return response()->json(['error' => 'User not found or administrator role cannot be changed here.'], 404);
        }
        $user->update(['role' => $data['role']]);

        return response()->json(['user' => $user->fresh()->toApiArray()]);
    }
}
