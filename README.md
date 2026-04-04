# BuddyScript (Full Stack)

BuddyScript is a lightweight social feed app with a Next.js frontend and a Laravel API backend. Users can register/login, create public or private posts (with optional images), comment in threads, and like posts or comments.

**Project Layout**
- `front` Next.js 16 + React 19 frontend
- `server` Laravel 12 REST API

**Key Features**
- Auth flow with protected/guest routes
- Virtualized feed with infinite pagination
- Post creation with image upload and visibility controls
- Threaded comments with replies
- Likes on posts and comments
- Profile + settings screens

**Tech Stack**
- Frontend: Next.js 16, React 19, TypeScript, TanStack React Query, Axios, React Virtuoso
- Backend: Laravel 12, PHP 8.2, Sanctum, MySQL (or any supported DB)

**Getting Started**
1. Backend setup

```bash
cd server
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

API base URL (local):
```
http://localhost:8000/api
```

2. Frontend setup

```bash
cd front
npm install
cp .env.example .env
npm run dev
```

Open:
```
http://localhost:3000
```

**Environment Variables**
Frontend (`front/.env`):
- `NEXT_PUBLIC_API_BASE_URL` (example: `http://127.0.0.1:8000/api`)
- `NEXT_PUBLIC_LARAVEL_APP_BASE_URL`
- `NEXT_PUBLIC_APP_ENVIRONMENT`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_VERSION`

Backend (`server/.env`):
- `DB_CONNECTION`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`

**Useful Scripts**
Frontend (`front`):
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

Backend (`server`):
- `composer run setup`
- `composer run dev`
- `composer run test`

**Docs**
- Frontend details: `front/README.md`
- Backend API details: `server/README.md`
