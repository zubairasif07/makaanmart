<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $email = trim((string) env('ADMIN_EMAIL'));
        $password = (string) env('ADMIN_PASSWORD');
        if ($email !== '' && $password !== '') {
            User::firstOrCreate(
                ['email' => mb_strtolower($email)],
                [
                    'name' => env('ADMIN_NAME', 'Administrator'),
                    'phone' => env('ADMIN_PHONE', '0000000000'),
                    'role' => 'admin',
                    'verified' => true,
                    'password' => $password,
                ]
            );
        }
    }
}
