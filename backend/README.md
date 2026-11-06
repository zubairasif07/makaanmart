# MakaanMart API

Laravel 12 REST API for the MakaanMart React frontend. It supports MySQL locally and PostgreSQL in production, and uses Sanctum bearer tokens.

## Requirements

- PHP 8.2 or newer with `pdo_mysql`, `openssl`, `mbstring`, `fileinfo`, and `curl`
- Composer
- MySQL or MariaDB
- Node.js 22 or newer (for the frontend)

## Local setup

1. Start MySQL/MariaDB and create an empty database named `makaanmart` with `utf8mb4` encoding in XAMPP.
2. Copy `.env.example` to `.env`, set the database username/password, then run `php artisan key:generate`.
3. Apply the schema: `php artisan migrate`.
4. Optionally set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then run `php artisan db:seed` to create an administrator account.
5. From the repository root, run `npm run dev`. The launcher starts Laravel on `http://127.0.0.1:8000` and Vite on `http://127.0.0.1:5173`.

The local launcher selects PHP 8.2+ from `PHP_EXECUTABLE`, the system PATH, or the WinGet PHP installation. If PHP is installed elsewhere, set `PHP_EXECUTABLE` to its `php.exe` path.

To run only the API, use `npm start`. The API health check is available at `/api/health`.

## API

The API keeps the existing frontend paths for authentication, listings, seller workflows, inquiries, favorites, saved searches, administration, agents, cities, and blog posts. New listing submissions start as `pending` and require administrator approval before becoming public.

To create an administrator, configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` before seeding. No default administrator password is provided.

## Vercel deployment

The API can run as a Vercel Container Runtime (Beta) project using this directory's Dockerfile. Create a separate Vercel project from this repository and set its Root Directory to `backend`; choose the Container framework preset if Vercel does not detect it automatically. The existing Vercel project serves the frontend. Attach a persistent PostgreSQL database such as Neon and configure these Production environment variables:

- `APP_ENV=production`, `APP_DEBUG=false`, `LOG_CHANNEL=stderr`, and a generated `APP_KEY` (run `php artisan key:generate --show` locally to create one)
- `APP_URL` set to the backend's Vercel deployment URL
- `DB_CONNECTION=pgsql` and `DB_URL` set to the provider's PostgreSQL connection string
- `CORS_ALLOWED_ORIGINS=https://makaanmart.vercel.app`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` from Cloudinary
- Optionally set `CLOUDINARY_FOLDER` (defaults to `makaanmart/properties`)

After deployment, verify `/api/health`, then set `VITE_API_URL` in the frontend Vercel project to the backend URL plus `/api` and redeploy the frontend. The backend container applies migrations at startup. No sample properties are seeded; sellers' listings remain pending until an administrator approves them.

Vercel's container runtime is currently in Beta. The API requires external persistent PostgreSQL and Cloudinary because container instances can scale or restart and their local files are not durable. Review the current Vercel and provider plans before enabling production traffic.

The repository root also contains a Render Blueprint for an alternative Laravel deployment. Configure `CORS_ALLOWED_ORIGINS` to the exact frontend origins when changing deployment domains.
