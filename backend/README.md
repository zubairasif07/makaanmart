# MakaanMart API

Laravel 12 REST API for the MakaanMart React frontend. It supports MySQL locally and PostgreSQL on Render, and uses Sanctum bearer tokens.

## Requirements

- PHP 8.2 or newer with `pdo_mysql`, `openssl`, `mbstring`, `fileinfo`, and `curl`
- Composer
- MySQL or MariaDB
- Node.js 22 or newer (for the frontend)

## Local setup

1. Start MySQL/MariaDB and create an empty database named `makaanmart` with `utf8mb4` encoding in XAMPP.
2. Copy `.env.example` to `.env`, set the database username/password, then run `php artisan key:generate`.
3. Apply the schema and sample listings: `php artisan migrate --seed`.
4. Optionally set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then run `php artisan db:seed` to create an administrator account.
5. From the repository root, run `npm run dev`. The launcher starts Laravel on `http://127.0.0.1:8000` and Vite on `http://127.0.0.1:5173`.

The local launcher selects PHP 8.2+ from `PHP_EXECUTABLE`, the system PATH, or the WinGet PHP installation. If PHP is installed elsewhere, set `PHP_EXECUTABLE` to its `php.exe` path.

To run only the API, use `npm start`. The API health check is available at `/api/health`.

## API

The API keeps the existing frontend paths for authentication, listings, seller workflows, inquiries, favorites, saved searches, administration, agents, cities, and blog posts. New listing submissions start as `pending` and require administrator approval before becoming public.

To create an administrator, configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` before seeding. No default administrator password is provided.

## Render deployment

The repository root contains a Render Blueprint that deploys this API with PostgreSQL. Apply it in Render using the connected GitHub repository. The Docker image migrates the database and runs `DatabaseSeeder` before starting Laravel; this seeds the existing sample listings. The API health check is `/api/health`.

The Blueprint is configured for free resources. Free web services can sleep when idle, and free database availability and retention are subject to Render's current limits; use a persistent database plan for real customer data. Set `CORS_ALLOWED_ORIGINS` to the exact frontend origins when changing deployment domains.
