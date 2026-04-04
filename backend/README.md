# BuddyScript (Laravel API)

A Laravel 12 REST API that powers a simple social feed: users can register/login, create posts (with optional images and visibility), comment in threads, and like posts or comments.

## Purpose
BuddyScript provides the backend for a lightweight social platform with:
- Token-based authentication via Laravel Sanctum
- Public/private posts
- Nested comments (replies)
- Polymorphic likes on posts and comments

## Tech Stack
- PHP ^8.2
- Laravel ^12.0
- Laravel Sanctum ^4.2
- MySQL or any Laravel-supported database

## Project Structure (High Level)
- `app/Http/Controllers/User` Auth and user profile/password endpoints
- `app/Http/Controllers/Api` Posts, comments, likes endpoints
- `app/Http/Requests` Request validation rules
- `app/Models` Eloquent models
- `app/Services` Business logic for posts and comments
- `routes/api.php` API entry point (includes sub-route files)
- `routes/Auth` Auth-related routes
- `routes/User` User profile routes
- `routes/Api` Posts, likes, comments routes
- `database/migrations` Database schema
- `BuddyScript.postman_collection.json` Postman collection for the API

## Requirements
- PHP 8.2+
- Composer
- Node.js + npm (for asset build scripts)
- A database (MySQL recommended)

## Setup
1. Install PHP dependencies:

```bash
composer install
```

2. Copy env file and generate app key:

```bash
cp .env.example .env
php artisan key:generate
```

3. Configure your database in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=buddyscript
DB_USERNAME=root
DB_PASSWORD=
```

4. Run migrations:

```bash
php artisan migrate
```

5. (Optional) Build frontend assets if needed:

```bash
npm install
npm run build
```

6. Create a storage symlink for public images:

```bash
php artisan storage:link
```

7. Run the server:

```bash
php artisan serve
```

Base URL (local):
```
http://localhost:8000/api
```

## Authentication
- Uses Laravel Sanctum (token-based auth).
- Public routes: register, login
- Protected routes require a `Bearer` token in the `Authorization` header.

Example:
```
Authorization: Bearer YOUR_TOKEN
```

## API Structure
All API routes are loaded from `routes/api.php`:
- `routes/Auth/user.php`
- `routes/User/user.php`
- `routes/Api/postManagement.php`
  - `routes/Api/Post/post.php`
  - `routes/Api/Like/like.php`
  - `routes/Api/Comment/comment.php`

### Route Groups & Middleware
- Auth routes: `/auth/user/*` (public register/login, protected logout)
- User routes: `/user/*` (protected)
- Posts/Comments/Likes: protected under `auth:sanctum`

## API Endpoints

### Auth
Base: `/auth/user`

1. `POST /auth/user/register`
- Purpose: Register a new user and return a Sanctum token
- Body (JSON):
  - `first_name` (string, required)
  - `last_name` (string, required)
  - `email` (email, required, unique)
  - `password` (string, required, min 8, must include uppercase, number, special char)
- Response: `201` with user + token

2. `POST /auth/user/login`
- Purpose: Login and return a Sanctum token
- Body (JSON):
  - `email` (email, required)
  - `password` (string, required)
- Response: `200` with user + token

3. `POST /auth/user/logout`
- Purpose: Revoke current token
- Auth: Bearer token required
- Response: `200` success message

### User
Base: `/user`

1. `PUT /user/update-profile`
- Purpose: Update first/last name
- Auth: Bearer token required
- Body (JSON):
  - `first_name` (string, required)
  - `last_name` (string, required)
- Response: `200` updated user data

2. `PUT /user/update-password`
- Purpose: Change password
- Auth: Bearer token required
- Body (JSON):
  - `current_password` (string, required)
  - `new_password` (string, required, min 8, uppercase, number, special char)
  - `new_password_confirmation` (string, required, must match new_password)
- Response: `200` success message

### Posts
Base: `/posts`

1. `GET /posts`
- Purpose: List posts (public + own private for authenticated users)
- Auth: Optional
- Query:
  - `per_page` (default 10)
  - `page` (default 1)
- Response: Paginated posts with user, likes, likes_count

2. `GET /posts/user/{userId}`
- Purpose: List posts by a specific user
- Auth: Required (only allowed for the same user id)
- Query:
  - `per_page`, `page`
- Response: Paginated posts

3. `POST /posts`
- Purpose: Create a post
- Auth: Required
- Body:
  - `content` (string, required, max 1000)
  - `visibility` (public|private, required)
  - `image` (file, optional, jpeg/png/jpg/gif, max 5048 KB)
- Content-Type: `multipart/form-data`
- Response: `201` created post

4. `GET /posts/{post}`
- Purpose: Get a single post
- Auth: Required
- Response: Post with user, likes, likes_count

5. `PUT /posts/{post}`
- Purpose: Update a post (JSON)
- Auth: Required (must be owner)
- Body (JSON):
  - `content` (string, optional)
  - `visibility` (public|private, optional)
- Response: `200` updated post

6. `POST /posts/{post}`
- Purpose: Update a post with file upload (multipart)
- Auth: Required (must be owner)
- Body (multipart/form-data):
  - `content` (string, optional)
  - `visibility` (public|private, optional)
  - `image` (file, optional)
- Response: `200` updated post

7. `DELETE /posts/{post}`
- Purpose: Delete a post
- Auth: Required (must be owner)
- Response: `200` success message

### Comments
Base: `/post`

1. `GET /post/{postId}/comments`
- Purpose: List comments (threaded) for a post
- Auth: Required
- Response: All top-level comments with nested replies, user, likes, likes_count

2. `POST /post/comments/{postId}`
- Purpose: Add a comment to a post (or reply to another comment)
- Auth: Required
- Body (JSON):
  - `content` (string, required, max 1000)
  - `parent_id` (nullable, must be valid comment id)
- Response: `201` created comment

3. `PUT /post/comments/{comment}`
- Purpose: Update a comment
- Auth: Required (must be owner)
- Body (JSON):
  - `content` (string, required, max 1000)
- Response: `200` updated comment

4. `DELETE /post/comments/{comment}`
- Purpose: Delete a comment and its thread
- Auth: Required (must be owner)
- Response: `200` success message

### Likes
Base: `/like`

1. `POST /like/{type}/{id}`
- Purpose: Toggle like on a post or comment
- Auth: Required
- Path params:
  - `type`: `post` or `comment`
  - `id`: post_id or comment_id
- Response: liked status, count, users

2. `GET /like/{type}/{id}`
- Purpose: Get likes for a post or comment
- Auth: Required
- Response: count and users

## Validation Rules (Summary)
- Register:
  - `first_name`, `last_name` required
  - `email` unique
  - `password` min 8, must include uppercase, number, special char
- Post create:
  - `content` required, max 1000
  - `visibility` required: `public|private`
  - `image` optional, jpeg/png/jpg/gif, max 5048 KB
- Post update:
  - `content` optional, max 1000
  - `visibility` optional: `public|private`
  - `image` optional, same limits
- Comment create/update:
  - `content` required, max 1000
  - `parent_id` nullable, must exist
- Password update:
  - `current_password` required
  - `new_password` min 8, uppercase, number, special char
  - `new_password_confirmation` must match

## Data Model (Tables)

### users
- `id` (PK)
- `first_name`
- `last_name`
- `email` (unique)
- `password`
- `email_verified_at` (nullable)
- `remember_token` (nullable)
- `created_at`, `updated_at`

### posts
- `id` (PK)
- `user_id` (FK -> users)
- `content` (text)
- `image` (string, nullable)
- `visibility` (enum: public|private)
- `created_at`, `updated_at`, `deleted_at`

### comments
- `id` (PK)
- `post_id` (FK -> posts)
- `user_id` (FK -> users)
- `parent_id` (FK -> comments, nullable)
- `content` (longText)
- `created_at`, `updated_at`, `deleted_at`

### likes
- `id` (PK)
- `user_id` (FK -> users)
- `likeable_id` (polymorphic id)
- `likeable_type` (polymorphic type)
- `created_at`, `updated_at`
- unique: (`user_id`, `likeable_id`, `likeable_type`)

## Error Handling
- `401 Unauthorized` for missing/invalid token
- `403 Unauthorized` for owner-only actions (posts/comments)
- `422 Validation error` for invalid payloads
- `500` for unexpected server errors in comments service

## Postman Collection
Import `BuddyScript.postman_collection.json` for ready-made requests.

## Common Response Shapes (Examples)

### Auth Register/Login
```json
{
  "message": "Logged in successfully",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  },
  "token": "..."
}
```

### Create Post
```json
{
  "message": "Post created!",
  "post": {
    "id": 1,
    "user_id": 1,
    "content": "Hello world!",
    "image": "posts/abc.jpg",
    "visibility": "public",
    "created_at": "...",
    "updated_at": "...",
    "user": { "id": 1, "first_name": "John", "last_name": "Doe", "email": "john@example.com" }
  }
}
```

### Like Toggle
```json
{
  "liked": true,
  "count": 3,
  "users": [
    { "id": 1, "first_name": "John", "last_name": "Doe", "email": "john@example.com" }
  ]
}
```

### Comments List
```json
{
  "post_id": 1,
  "comments": [
    {
      "id": 10,
      "post_id": 1,
      "user_id": 1,
      "parent_id": null,
      "content": "Nice post!",
      "likes_count": 0,
      "user": { "id": 1, "first_name": "John", "last_name": "Doe" },
      "replies": []
    }
  ]
}
```

## Notes
- Posts list (`GET /posts`) is public and includes only public posts when not authenticated.
- `GET /posts/user/{userId}` only allows the authenticated user to request their own posts.
- Comment threads are returned with nested replies and likes.

## Scripts (composer.json)
- `composer run setup`: install deps, copy env, key generate, migrate, npm install/build
- `composer run dev`: run API server, queue, logs, and Vite
- `composer run test`: clear config and run tests
