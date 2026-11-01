<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class SavedSearch extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'user_id', 'name', 'filters'];

    protected function casts(): array
    {
        return ['filters' => 'array'];
    }

    protected static function booted(): void
    {
        static::creating(function (SavedSearch $search): void {
            $search->id ??= (string) Str::uuid();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function toApiArray(): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'filters' => $this->filters,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
