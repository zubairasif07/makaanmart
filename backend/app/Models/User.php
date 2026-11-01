<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'verified',
        'avatar',
        'agency',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'verified' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            $user->id ??= (string) Str::uuid();
        });
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class, 'owner_id');
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class, 'buyer_id');
    }

    public function toApiArray(): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'role' => $this->role,
            'verified' => (bool) $this->verified,
            'createdAt' => $this->created_at?->toISOString(),
            'agency' => $this->agency,
        ];
    }

    public function toAgentArray(): array
    {
        $properties = Property::query()->where('owner_id', $this->id)->where('status', 'active')->get();

        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'avatar' => $this->avatar ?? '',
            'agency' => $this->agency,
            'phone' => $this->phone,
            'whatsapp' => preg_replace('/\D/', '', $this->phone) ?? '',
            'email' => $this->email,
            'verified' => (bool) $this->verified,
            'rating' => 0,
            'reviewCount' => 0,
            'totalListings' => $properties->count(),
            'activeSince' => $this->created_at?->toISOString(),
            'bio' => '',
            'cities' => $properties->map(fn (Property $property): ?string => $property->location['city'] ?? null)
                ->filter()->unique()->values()->all(),
        ];
    }
}
