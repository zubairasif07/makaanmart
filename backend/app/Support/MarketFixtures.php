<?php

namespace App\Support;

use RuntimeException;

class MarketFixtures
{
    private static ?array $data = null;

    public static function all(): array
    {
        if (self::$data !== null) {
            return self::$data;
        }

        $path = database_path('seeders/data/fixtures.json');
        $json = file_get_contents($path);
        if ($json === false) {
            throw new RuntimeException('Marketplace seed fixtures could not be read.');
        }

        self::$data = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

        return self::$data;
    }

    public static function agents(): array
    {
        return self::all()['agents'];
    }

    public static function cities(): array
    {
        return self::all()['cities'];
    }

    public static function blogPosts(): array
    {
        return self::all()['blogPosts'];
    }
}
