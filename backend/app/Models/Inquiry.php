<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Inquiry extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'property_id',
        'buyer_id',
        'buyer_name',
        'buyer_email',
        'buyer_phone',
        'message',
        'type',
        'status',
        'created_at',
    ];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::creating(function (Inquiry $inquiry): void {
            $inquiry->id ??= (string) Str::uuid();
        });
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function toApiArray(): array
    {
        return [
            'id' => (string) $this->id,
            'propertyId' => (string) $this->property_id,
            'propertyTitle' => $this->property?->title,
            'buyerName' => $this->buyer_name,
            'buyerEmail' => $this->buyer_email,
            'buyerPhone' => $this->buyer_phone,
            'message' => $this->message,
            'type' => $this->type,
            'status' => $this->status,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
