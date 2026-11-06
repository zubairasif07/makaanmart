<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PropertyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Property::query()->where('status', 'active')->with('owner')->withCount('inquiries');
        $filters = $request->query();

        if (filled($filters['q'] ?? null)) {
            $terms = preg_split('/\s+/', trim((string) $filters['q'])) ?: [];
            foreach ($terms as $term) {
                $query->where(function (Builder $search) use ($term): void {
                    $like = '%'.$term.'%';
                    $search->where('title', 'like', $like)
                        ->orWhere('description', 'like', $like)
                        ->orWhere('location->city', 'like', $like)
                        ->orWhere('location->area', 'like', $like)
                        ->orWhere('location->society', 'like', $like)
                        ->orWhere('location->address', 'like', $like)
                        ->orWhere('type', 'like', $like);
                });
            }
        }

        foreach ([
            'purpose' => 'purpose',
            'type' => 'type',
            'areaUnit' => 'area_unit',
            'furnished' => 'furnished',
        ] as $requestKey => $column) {
            $value = $filters[$requestKey] ?? null;
            if (filled($value)) {
                $query->where($column, $value);
            }
        }
        if (($filters['featured'] ?? null) === 'true') {
            $query->where('featured', true);
        }
        if (filled($filters['city'] ?? null)) {
            $query->where('location->city', $filters['city']);
        }
        if (filled($filters['area'] ?? null)) {
            $query->where('location->area', 'like', '%'.$filters['area'].'%');
        }
        foreach ([
            'minPrice' => ['price', '>='],
            'maxPrice' => ['price', '<='],
            'minArea' => ['area', '>='],
            'maxArea' => ['area', '<='],
        ] as $key => [$column, $operator]) {
            if (isset($filters[$key]) && is_numeric($filters[$key])) {
                $query->where($column, $operator, $filters[$key]);
            }
        }
        foreach ([
            'minBeds' => ['bedrooms', '>='],
            'maxBeds' => ['bedrooms', '<='],
            'minBaths' => ['bathrooms', '>='],
        ] as $key => [$column, $operator]) {
            if (isset($filters[$key]) && is_numeric($filters[$key])) {
                $query->where($column, $operator, $filters[$key]);
            }
        }
        if (isset($filters['postedWithin']) && is_numeric($filters['postedWithin'])) {
            $query->where('posted_at', '>=', now()->subDays((int) $filters['postedWithin']));
        }
        foreach (array_filter(explode(',', (string) ($filters['amenities'] ?? ''))) as $amenity) {
            $query->whereJsonContains('amenities', $amenity);
        }

        match ($filters['sort'] ?? 'newest') {
            'price-asc' => $query->orderBy('price'),
            'price-desc' => $query->orderByDesc('price'),
            'popular' => $query->orderByDesc('views'),
            default => $query->orderByDesc('posted_at'),
        };

        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = min(48, max(1, (int) ($filters['limit'] ?? 12)));
        $total = (clone $query)->count();
        $data = $query->forPage($page, $limit)->get()->map(
            fn (Property $property): array => $property->toApiArray()
        );

        return response()->json([
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'totalPages' => (int) ceil($total / $limit),
        ]);
    }

    public function featured(): JsonResponse
    {
        return response()->json(
            Property::query()->where('status', 'active')->where('featured', true)
                ->with('owner')->withCount('inquiries')->orderByDesc('posted_at')->limit(6)->get()
                ->map(fn (Property $property): array => $property->toApiArray())
        );
    }

    public function latest(Request $request): JsonResponse
    {
        $limit = min(48, max(1, (int) $request->query('limit', 8)));

        return response()->json(
            Property::query()->where('status', 'active')->with('owner')->withCount('inquiries')
                ->orderByDesc('posted_at')->limit($limit)->get()
                ->map(fn (Property $property): array => $property->toApiArray())
        );
    }

    public function showById(string $id): JsonResponse
    {
        $property = Property::query()->where('status', 'active')->with('owner')
            ->withCount('inquiries')->find($id);
        if (! $property) {
            return response()->json(['error' => 'Property not found.'], 404);
        }

        return response()->json($property->toApiArray());
    }

    public function showBySlug(string $slug): JsonResponse
    {
        $property = Property::query()->where('status', 'active')->where('slug', $slug)
            ->with('owner')->withCount('inquiries')->first();
        if (! $property) {
            return response()->json(['error' => 'Property not found.'], 404);
        }
        $property->increment('views');
        $property->views++;

        return response()->json($property->toApiArray());
    }

    public function similar(string $id): JsonResponse
    {
        $selected = Property::query()->find($id);
        if (! $selected) {
            return response()->json([]);
        }

        return response()->json(
            Property::query()->where('status', 'active')->where('id', '!=', $selected->id)
                ->where('type', $selected->type)
                ->where('location->city', $selected->location['city'] ?? '')
                ->with('owner')->withCount('inquiries')->limit(4)->get()
                ->map(fn (Property $property): array => $property->toApiArray())
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'min:8', 'max:255'],
            'purpose' => ['required', Rule::in(['buy', 'rent', 'commercial'])],
            'type' => ['required', Rule::in(['house', 'apartment', 'plot', 'shop', 'office', 'farmhouse', 'industrial', 'room', 'project'])],
            'price' => ['required', 'numeric', 'gt:0'],
            'area' => ['required', 'numeric', 'gt:0'],
            'areaUnit' => ['nullable', Rule::in(['marla', 'kanal', 'sqft', 'sqm'])],
            'city' => ['required', 'string', 'max:120'],
            'areaName' => ['required', 'string', 'max:160'],
            'address' => ['nullable', 'string', 'max:255'],
            'bedrooms' => ['nullable', 'integer', 'min:0', 'max:100'],
            'bathrooms' => ['nullable', 'integer', 'min:0', 'max:100'],
            'floors' => ['nullable', 'integer', 'min:0', 'max:100'],
            'parkingSpaces' => ['nullable', 'integer', 'min:0', 'max:100'],
            'furnished' => ['nullable', Rule::in(['furnished', 'semi-furnished', 'unfurnished'])],
            'description' => ['required', 'string', 'min:20'],
            'amenities' => ['nullable', 'array', 'max:30'],
            'amenities.*' => ['string', 'max:80'],
            'images' => ['nullable', 'array', 'max:20'],
            'images.*' => ['url', 'max:2048'],
            'videoUrl' => ['nullable', 'url', 'max:2048'],
        ]);

        $title = trim($data['title']);
        $images = collect($data['images'] ?? [])->values()->map(
            fn (string $url, int $index): array => [
                'url' => $url,
                'alt' => $title.' - photo '.($index + 1),
                'isPrimary' => $index === 0,
            ]
        )->all();
        $property = Property::create([
            'id' => (string) Str::uuid(),
            'slug' => Str::slug($title).'-'.Str::lower(Str::random(8)),
            'owner_id' => $request->user()->id,
            'title' => $title,
            'purpose' => $data['purpose'],
            'type' => $data['type'],
            'status' => 'pending',
            'price' => $data['price'],
            'area' => $data['area'],
            'area_unit' => $data['areaUnit'] ?? 'marla',
            'bedrooms' => $data['bedrooms'] ?? null,
            'bathrooms' => $data['bathrooms'] ?? null,
            'floors' => $data['floors'] ?? null,
            'parking_spaces' => $data['parkingSpaces'] ?? null,
            'furnished' => $data['furnished'] ?? null,
            'location' => [
                'city' => trim($data['city']),
                'area' => trim($data['areaName']),
                'address' => trim($data['address'] ?? ''),
            ],
            'description' => trim($data['description']),
            'amenities' => $data['amenities'] ?? [],
            'images' => $images,
            'video_url' => $data['videoUrl'] ?? null,
            'featured' => false,
            'premium' => false,
            'verified' => false,
            'views' => 0,
            'posted_at' => now(),
        ]);

        return response()->json([
            'property' => $property->load('owner')->loadCount('inquiries')->toApiArray(),
        ], 201);
    }

    public function sellerListings(Request $request): JsonResponse
    {
        $query = Property::query()->with('owner')->withCount('inquiries')->orderByDesc('posted_at');
        if ($request->user()->role !== 'admin') {
            $query->where('owner_id', $request->user()->id);
        }

        return response()->json($query->get()->map(fn (Property $property): array => $property->toApiArray()));
    }

    public function update(Request $request, string $id): JsonResponse|Response
    {
        $property = Property::query()->with('owner')->find($id);
        if (! $property) {
            return response()->json(['error' => 'Listing not found.'], 404);
        }
        if ($request->user()->role !== 'admin' && $property->owner_id !== $request->user()->id) {
            return response()->json(['error' => 'You can only edit your own listings.'], 403);
        }
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['draft', 'pending', 'active', 'sold', 'rejected'])],
            'title' => ['sometimes', 'string', 'min:8', 'max:255'],
            'price' => ['sometimes', 'numeric', 'gt:0'],
            'area' => ['sometimes', 'numeric', 'gt:0'],
            'areaUnit' => ['sometimes', Rule::in(['marla', 'kanal', 'sqft', 'sqm'])],
            'bedrooms' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'bathrooms' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'floors' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'parkingSpaces' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'furnished' => ['sometimes', 'nullable', Rule::in(['furnished', 'semi-furnished', 'unfurnished'])],
            'description' => ['sometimes', 'string', 'min:20'],
            'amenities' => ['sometimes', 'array', 'max:30'],
            'images' => ['sometimes', 'array', 'max:20'],
            'images.*' => ['url', 'max:2048'],
            'location' => ['sometimes', 'array'],
            'location.city' => ['required_with:location', 'string', 'max:120'],
            'location.area' => ['required_with:location', 'string', 'max:160'],
            'purpose' => ['sometimes', Rule::in(['buy', 'rent', 'commercial'])],
            'type' => ['sometimes', Rule::in(['house', 'apartment', 'plot', 'shop', 'office', 'farmhouse', 'industrial', 'room', 'project'])],
            'videoUrl' => ['sometimes', 'nullable', 'url', 'max:2048'],
        ]);

        $nextStatus = $data['status'] ?? null;
        if ($request->user()->role !== 'admin' && $nextStatus === 'active') {
            return response()->json(['error' => 'Listings must be approved by an administrator.'], 403);
        }

        $mapped = [
            'price' => 'price',
            'area' => 'area',
            'areaUnit' => 'area_unit',
            'bedrooms' => 'bedrooms',
            'bathrooms' => 'bathrooms',
            'floors' => 'floors',
            'parkingSpaces' => 'parking_spaces',
            'furnished' => 'furnished',
            'description' => 'description',
            'amenities' => 'amenities',
            'images' => 'images',
            'location' => 'location',
            'purpose' => 'purpose',
            'type' => 'type',
            'title' => 'title',
            'videoUrl' => 'video_url',
        ];
        foreach ($mapped as $input => $column) {
            if (array_key_exists($input, $data)) {
                $property->{$column} = $data[$input];
            }
        }
        if ($request->user()->role === 'admin' && $nextStatus !== null) {
            $property->status = $nextStatus;
        } elseif ($nextStatus === 'sold') {
            $property->status = 'sold';
        }
        $property->save();

        return response()->json([
            'property' => $property->fresh()->load('owner')->loadCount('inquiries')->toApiArray(),
        ]);
    }

    public function destroy(Request $request, string $id): Response|JsonResponse
    {
        $property = Property::query()->find($id);
        if (! $property) {
            return response()->json(['error' => 'Listing not found.'], 404);
        }
        if ($request->user()->role !== 'admin' && $property->owner_id !== $request->user()->id) {
            return response()->json(['error' => 'You can only delete your own listings.'], 403);
        }

        $property->delete();

        return response()->noContent();
    }

    public function upload(Request $request): JsonResponse
    {
        $data = $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:20'],
            'images.*' => ['required', 'image', 'mimes:jpeg,png,webp,avif', 'max:8192'],
        ]);

        $cloudName = config('services.cloudinary.cloud_name');
        $apiKey = config('services.cloudinary.api_key');
        $apiSecret = config('services.cloudinary.api_secret');
        $urls = [];
        if (! $cloudName || ! $apiKey || ! $apiSecret) {
            if (app()->isLocal()) {
                $directory = public_path('uploads');
                if (! is_dir($directory) && ! mkdir($directory, 0755, true) && ! is_dir($directory)) {
                    throw new \RuntimeException('The local upload directory could not be created.');
                }

                foreach ($data['images'] as $image) {
                    $filename = Str::uuid().'.'.$image->extension();
                    $image->move($directory, $filename);
                    $urls[] = $request->getSchemeAndHttpHost().'/uploads/'.rawurlencode($filename);
                }

                return response()->json(['images' => $urls], 201);
            }

            return response()->json(['error' => 'Image storage is not configured.'], 503);
        }

        foreach ($data['images'] as $image) {
            $parameters = [
                'folder' => config('services.cloudinary.folder'),
                'public_id' => (string) Str::uuid(),
                'timestamp' => now()->timestamp,
            ];
            ksort($parameters);
            $signature = sha1(collect($parameters)
                ->map(fn (string|int $value, string $key): string => $key.'='.$value)
                ->implode('&').$apiSecret);

            try {
                $response = Http::timeout(30)
                    ->attach('file', file_get_contents($image->getRealPath()), $image->getClientOriginalName())
                    ->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", [
                        ...$parameters,
                        'api_key' => $apiKey,
                        'signature' => $signature,
                    ]);
            } catch (\Illuminate\Http\Client\ConnectionException $exception) {
                Log::warning('Cloudinary image upload could not connect.', ['message' => $exception->getMessage()]);

                return response()->json(['error' => 'Image storage is temporarily unavailable.'], 502);
            }

            if (! $response->successful() || ! is_string($response->json('secure_url'))) {
                Log::warning('Cloudinary image upload failed.', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                return response()->json(['error' => 'Image storage rejected the upload.'], 502);
            }

            $urls[] = $response->json('secure_url');
        }

        return response()->json(['images' => $urls], 201);
    }
}
