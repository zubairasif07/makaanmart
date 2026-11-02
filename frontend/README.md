# MakaanMart Frontend

The React, TypeScript, and Vite frontend connects to the Laravel API in `../backend`. The Vite development server proxies `/api` and `/uploads` requests to Laravel on port 8000.

## Run locally

Configure the Laravel/MySQL backend using [`../backend/README.md`](../backend/README.md), then run from the repository root:

```powershell
npm install
npm install --prefix frontend
npm run dev
```

The local launcher starts Laravel and Vite together. Open `http://127.0.0.1:5173`.

Production builds without `VITE_API_URL` display the built-in sample properties without requiring a backend. Set `VITE_API_URL` to the deployed Laravel API URL (including `/api`) when connecting a production backend.

## Validate and build

```powershell
npm run lint
npm run build
```

`npm start` starts the Laravel API only. The frontend build can be served by a static hosting provider.
