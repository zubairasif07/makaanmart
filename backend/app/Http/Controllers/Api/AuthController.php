<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['required', 'string', 'max:40'],
            'role' => ['required', Rule::in(['buyer', 'seller'])],
        ]);
        if (strlen(preg_replace('/\D/', '', $data['phone']) ?? '') < 10) {
            return response()->json(['error' => 'Enter a valid phone number.'], 400);
        }

        $user = User::create([
            ...$data,
            'name' => trim($data['name']),
            'email' => mb_strtolower(trim($data['email'])),
            'phone' => trim($data['phone']),
            'verified' => false,
        ]);

        return response()->json([
            'token' => $user->createToken('makaanmart-web')->plainTextToken,
            'user' => $user->toApiArray(),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', mb_strtolower(trim($data['email'])))->first();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['error' => 'Email or password is incorrect.'], 401);
        }

        return response()->json([
            'token' => $user->createToken('makaanmart-web')->plainTextToken,
            'user' => $user->toApiArray(),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()->toApiArray()]);
    }

    public function logout(Request $request): Response
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->noContent();
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'phone' => ['required', 'string', 'max:40'],
        ]);
        if (strlen(preg_replace('/\D/', '', $data['phone']) ?? '') < 10) {
            return response()->json(['error' => 'Enter a valid phone number.'], 400);
        }

        $request->user()->update([
            'name' => trim($data['name']),
            'phone' => trim($data['phone']),
        ]);

        return response()->json(['user' => $request->user()->fresh()->toApiArray()]);
    }
}
