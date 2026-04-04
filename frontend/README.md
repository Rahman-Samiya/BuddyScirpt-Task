# Buddy Script Frontend

Buddy Script is a social feed frontend built with Next.js and React. It ships with authentication, a virtualized feed, post creation with image upload, likes, comments, and profile/settings pages.

**Features**
- Auth flow with login, registration, and protected/guest routes.
- Feed with infinite pagination (React Query) and virtualized rendering (React Virtuoso).
- Create, edit, delete posts with visibility (public/private) and optional image upload.
- Post interactions: likes, share, and threaded comments with replies.
- Post detail view at `/feed/[id]` with visibility checks.
- Profile page showing user details and their posts.
- Settings page for profile updates and password change.
- Dark mode toggle on feed, profile, and post detail screens.
- Responsive layout with mobile menu and bottom navigation.

**Tech Stack**
- Next.js 16 (App Router)
- React 19
- TypeScript
- TanStack React Query
- Axios
- React Virtuoso
- SweetAlert2
- Font Awesome
- Bootstrap + custom CSS

**Routes**
- `/login` Login screen (guest only)
- `/register` Registration screen (guest only)
- `/feed` Main feed (protected)
- `/feed/[id]` Post detail (protected)
- `/profile` My profile (protected)
- `/setting` Settings (protected)

**Project Structure**
- `src/app` App Router pages and providers
- `src/pages` Page-level UI components
- `src/components` Feed components and subcomponents
- `src/contexts` Auth context and token handling
- `src/services` API clients for auth, posts, comments, likes, and users
- `src/utils` Form validation helpers
- `public/assets` Static assets (CSS, images, JS)

**Getting Started**
1. Install dependencies.
2. Create `.env` from `.env.example` and update API URLs.
3. Run the dev server.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and you will be redirected to `/login`.

**Environment Variables**
- `NEXT_PUBLIC_API_BASE_URL` Base API URL (e.g. `http://127.0.0.1:8000/api`)
- `NEXT_PUBLIC_LARAVEL_APP_BASE_URL` Backend base URL
- `NEXT_PUBLIC_APP_ENVIRONMENT` Environment name (e.g. `development`)
- `NEXT_PUBLIC_APP_NAME` App display name
- `NEXT_PUBLIC_APP_VERSION` App version

**Scripts**
- `npm run dev` Start dev server
- `npm run build` Build for production
- `npm run start` Start production server
- `npm run lint` Run ESLint

**Notes**
- Auth tokens and user data are stored in `localStorage`.
- 401 responses dispatch a global `auth:unauthorized` event to trigger logout.
- Post composer limits images to 5MB and content to 1000 characters.
