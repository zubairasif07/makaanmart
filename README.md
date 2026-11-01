# MakaanMart

MakaanMart is a real-estate marketplace built with React, TypeScript, and Vite, backed by a Laravel 12 REST API and MySQL.

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
