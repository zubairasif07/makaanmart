<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\SavedSearch;
use App\Models\User;
use App\Support\MarketFixtures;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class MarketplaceController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'listings' => Property::query()->where('status', 'active')->count(),
            'cities' => Property::query()->where('status', 'active')
                ->get()->pluck('location.city')->filter()->unique()->count(),
            'buyers' => User::query()->where('role', 'buyer')->count(),
            'sellers' => User::query()->where('role', 'seller')->count(),
        ]);
    }

    public function agents(): JsonResponse
    {
        $agents = collect(MarketFixtures::agents())->map(function (array $agent): array {
            $count = Property::query()->where('status', 'active')
                ->where('agent_data->id', $agent['id'])->count();
            $agent['totalListings'] = $count ?: $agent['totalListings'];

            return $agent;
        });

        $registered = User::query()->whereIn('role', ['seller', 'admin'])->orderBy('created_at')
            ->get()->map(fn (User $user): array => $user->toAgentArray())
            ->reject(fn (array $agent): bool => $agents->contains('id', $agent['id']));

        return response()->json($agents->concat($registered)->values());
    }

    public function agent(string $id): JsonResponse
    {
        $agent = collect(MarketFixtures::agents())->firstWhere('id', $id);
        if ($agent) {
            return response()->json($agent);
        }

        $user = User::query()->where('id', $id)->whereIn('role', ['seller', 'admin'])->first();
        if (! $user) {
            return response()->json(['error' => 'Agent not found.'], 404);
        }

        return response()->json($user->toAgentArray());
    }

    public function agentListings(string $id): JsonResponse
    {
        $isFixture = collect(MarketFixtures::agents())->contains('id', $id);
        $query = Property::query()->where('status', 'active')->with('owner')->withCount('inquiries');
        if ($isFixture) {
            $query->where('agent_data->id', $id);
        } else {
            $query->where('owner_id', $id);
        }

        return response()->json($query->get()->map(fn (Property $property): array => $property->toApiArray()));
    }

    public function cities(): JsonResponse
    {
        $fixtures = collect(MarketFixtures::cities())->keyBy('name');
        $cities = Property::query()->where('status', 'active')->get()
            ->groupBy(fn (Property $property): string => (string) ($property->location['city'] ?? ''))
            ->filter(fn ($properties, string $city): bool => $city !== '')
            ->map(function ($properties, string $name) use ($fixtures): array {
                $slug = Str::slug($name);

                return [
                    'id' => $slug,
                    'name' => $name,
                    'image' => $fixtures->get($name)['image'] ?? 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80',
                    'listings' => $properties->count(),
                    'slug' => $slug,
                ];
            })->sortByDesc('listings')->values();

        return response()->json($cities);
    }

    public function blogPosts(): JsonResponse
    {
        return response()->json(MarketFixtures::blogPosts());
    }

    public function blogPost(string $slug): JsonResponse
    {
        $post = collect(MarketFixtures::blogPosts())->firstWhere('slug', $slug);
        if (! $post) {
            return response()->json(['error' => 'Article not found.'], 404);
        }

        return response()->json($post);
    }

    public function submitContact(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'subject' => ['required', 'string', 'min:3', 'max:160'],
            'message' => ['required', 'string', 'min:10', 'max:10000'],
        ]);
        if (filled($data['phone'] ?? null) && strlen(preg_replace('/\D/', '', $data['phone']) ?? '') < 10) {
            return response()->json(['error' => 'Enter a valid phone number.'], 400);
        }

        ContactMessage::create([
            ...$data,
            'name' => trim($data['name']),
            'email' => trim($data['email']),
            'phone' => trim($data['phone'] ?? ''),
            'subject' => trim($data['subject']),
            'message' => trim($data['message']),
        ]);

        return response()->json(['message' => 'Your message has been received.'], 201);
    }

    public function submitInquiry(Request $request): JsonResponse
    {
        $data = $request->validate([
            'propertyId' => ['required', 'string', 'max:64'],
            'buyerName' => ['required', 'string', 'min:2', 'max:255'],
            'buyerEmail' => ['required', 'email', 'max:255'],
            'buyerPhone' => ['required', 'string', 'max:40'],
            'message' => ['required', 'string', 'min:10'],
            'type' => ['nullable', Rule::in(['inquiry', 'viewing'])],
        ]);
        if (strlen(preg_replace('/\D/', '', $data['buyerPhone']) ?? '') < 10) {
            return response()->json(['error' => 'Enter a valid phone number.'], 400);
        }

        $property = Property::query()->where('id', $data['propertyId'])->where('status', 'active')->first();
        if (! $property) {
            return response()->json(['error' => 'This listing is no longer available.'], 404);
        }
        $user = Auth::guard('sanctum')->user();
        $inquiry = Inquiry::create([
            'property_id' => $property->id,
            'buyer_id' => $user?->id,
            'buyer_name' => trim($data['buyerName']),
            'buyer_email' => trim($data['buyerEmail']),
            'buyer_phone' => trim($data['buyerPhone']),
            'message' => trim($data['message']),
            'type' => $data['type'] ?? 'inquiry',
            'status' => 'new',
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your inquiry has been sent to the agent.',
            'inquiry' => $inquiry->load('property')->toApiArray(),
        ], 201);
    }

    public function myInquiries(Request $request): JsonResponse
    {
        return response()->json(
            Inquiry::query()->where('buyer_id', $request->user()->id)
                ->with('property')->orderByDesc('created_at')->get()
                ->map(fn (Inquiry $inquiry): array => $inquiry->toApiArray())
        );
    }

    public function sellerInquiries(Request $request): JsonResponse
    {
        $query = Inquiry::query()->with('property')->orderByDesc('created_at');
        if ($request->user()->role !== 'admin') {
            $query->whereHas('property', fn (Builder $property): Builder => $property->where('owner_id', $request->user()->id));
        }

        return response()->json($query->get()->map(fn (Inquiry $inquiry): array => $inquiry->toApiArray()));
    }

    public function updateInquiryStatus(Request $request, string $id): JsonResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(['read', 'replied'])]]);
        $inquiry = Inquiry::query()->with('property')->find($id);
        if (! $inquiry) {
            return response()->json(['error' => 'Inquiry not found.'], 404);
        }
        if ($request->user()->role !== 'admin' && $inquiry->property?->owner_id !== $request->user()->id) {
            return response()->json(['error' => 'You cannot update this inquiry.'], 403);
        }

        $inquiry->update(['status' => $data['status']]);

        return response()->json(['success' => true]);
    }

    public function favorites(Request $request): JsonResponse
    {
        return response()->json(
            DB::table('favorites')->where('user_id', $request->user()->id)
                ->orderBy('created_at')->pluck('property_id')->map(fn ($id): string => (string) $id)
        );
    }

    public function updateFavorites(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'max:500'],
            'ids.*' => ['required', 'string', 'max:64'],
        ]);
        $ids = array_values(array_unique($data['ids']));
        $existing = Property::query()->whereIn('id', $ids)->pluck('id')->all();

        DB::transaction(function () use ($request, $existing): void {
            DB::table('favorites')->where('user_id', $request->user()->id)->delete();
            foreach ($existing as $id) {
                DB::table('favorites')->insert([
                    'user_id' => $request->user()->id,
                    'property_id' => $id,
                    'created_at' => now(),
                ]);
            }
        });

        return response()->json($data['ids']);
    }

    public function savedSearches(Request $request): JsonResponse
    {
        return response()->json(
            SavedSearch::query()->where('user_id', $request->user()->id)->orderByDesc('created_at')
                ->get()->map(fn (SavedSearch $search): array => $search->toApiArray())
        );
    }

    public function storeSavedSearch(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'filters' => ['required', 'array'],
        ]);
        $search = SavedSearch::create([
            'user_id' => $request->user()->id,
            'name' => trim($data['name']),
            'filters' => $data['filters'],
        ]);

        return response()->json($search->toApiArray(), 201);
    }

    public function deleteSavedSearch(Request $request, string $id): Response|JsonResponse
    {
        $search = SavedSearch::query()->where('user_id', $request->user()->id)->find($id);
        if (! $search) {
            return response()->json(['error' => 'Saved search not found.'], 404);
        }
        $search->delete();

        return response()->noContent();
    }
}
