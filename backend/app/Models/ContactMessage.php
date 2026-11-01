<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ContactMessage extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'name', 'email', 'phone', 'subject', 'message'];

    protected static function booted(): void
    {
        static::creating(function (ContactMessage $message): void {
            $message->id ??= (string) Str::uuid();
        });
    }

    public function toApiArray(): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'subject' => $this->subject,
            'message' => $this->message,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
