<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'slug',
        'owner_id',
        'title',
        'purpose',
        'type',
        'status',
        'price',
        'price_unit',
        'area',
        'area_unit',
        'bedrooms',
        'bathrooms',
        'floors',
        'parking_spaces',
        'furnished',
        'location',
        'description',
        'amenities',
        'images',
        'video_url',
        'floor_plan_url',
        'agent_data',
        'featured',
        'premium',
        'verified',
        'price_drop',
        'views',
        'posted_at',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'area' => 'float',
            'bedrooms' => 'integer',
            'bathrooms' => 'integer',
            'floors' => 'integer',
            'parking_spaces' => 'integer',
            'location' => 'array',
            'amenities' => 'array',
            'images' => 'array',
            'agent_data' => 'array',
            'featured' => 'boolean',
            'premium' => 'boolean',
            'verified' => 'boolean',
            'price_drop' => 'float',
            'views' => 'integer',
            'posted_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    public function toApiArray(): array
    {
        $agent = $this->owner?->toAgentArray() ?? $this->agent_data;
        $inquiries = array_key_exists('inquiries_count', $this->getAttributes())
            ? (int) $this->getAttribute('inquiries_count')
            : $this->inquiries()->count();

        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'purpose' => $this->purpose,
            'type' => $this->type,
            'status' => $this->status,
            'price' => (float) $this->price,
            'priceUnit' => $this->price_unit,
            'area' => (float) $this->area,
            'areaUnit' => $this->area_unit,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'floors' => $this->floors,
            'parkingSpaces' => $this->parking_spaces,
            'furnished' => $this->furnished,
            'location' => $this->location ?? [],
            'description' => $this->description,
            'amenities' => $this->amenities ?? [],
            'images' => $this->images ?? [],
            'videoUrl' => $this->video_url,
            'floorPlanUrl' => $this->floor_plan_url,
            'agent' => $agent,
            'featured' => (bool) $this->featured,
            'premium' => (bool) $this->premium,
            'verified' => (bool) $this->verified,
            'priceDrop' => $this->price_drop,
            'views' => (int) $this->views,
            'inquiries' => $inquiries,
            'postedAt' => $this->posted_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
