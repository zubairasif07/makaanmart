# MakaanMart

MakaanMart is a real-estate marketplace built with React, TypeScript, and Vite, backed by a Laravel 12 REST API and a database.

## Requirements

- Node.js 22.13 or newer and npm
- PHP 8.2 or newer with `pdo_mysql`, `openssl`, `mbstring`, `fileinfo`, and `curl`
- Composer
- MySQL or MariaDB

## Local setup

1. Start MySQL and create an empty `makaanmart` database using `utf8mb4`.
2. Copy `backend/.env.example` to `backend/.env` and set your database credentials.
3. Install backend dependencies and initialize the application:

   ```powershell
   composer install --working-dir=backend
   php artisan key:generate --working-dir=backend
   php artisan migrate --seed --force --working-dir=backend
   ```

4. Install frontend dependencies and start the API and frontend:

   ```powershell
   npm install
   npm install --prefix frontend
   npm run dev
   ```

Open `http://127.0.0.1:5173`. The Vite development server proxies API and image-upload requests to Laravel on port 8000.

On Windows, if multiple PHP versions are installed, set `PHP_EXECUTABLE` to the PHP 8.2+ executable before running `npm run dev`. The launcher also detects a supported WinGet PHP installation.

For administrator access, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` before running the seeder. Do not commit `.env` files or credentials.

## Checks

```powershell
npm run build
npm run lint
php artisan test --working-dir=backend
```

See [backend setup and API notes](backend/README.md) and [frontend notes](frontend/README.md).

## Production deployment

The Vercel project serves the frontend from the `frontend` directory. The Laravel API and its database must be deployed separately. A Render Blueprint is provided in [`render.yaml`](./render.yaml); it creates a free web service and PostgreSQL database, runs migrations and seeds the sample properties at startup, and enables the production Vercel origin for API requests.

1. In Render, create a new Blueprint from this GitHub repository and apply `render.yaml`.
2. Wait for the `makaanmart-api` service to become healthy. Its health endpoint is `/api/health`.
3. In the Vercel project settings, add `VITE_API_URL` for Production and Preview, using the API URL plus `/api` (for example, `https://makaanmart-api.onrender.com/api`).
4. Redeploy the Vercel project so the frontend build uses the API URL.

The Render free web service may sleep when idle, and free database availability and retention are subject to Render's current limits. Upgrade to a persistent database plan before relying on this deployment for real customer data. The seeded listings are sample content, not verified offers.
