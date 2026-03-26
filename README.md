# Crowdly

Crowdly is a full-stack social feed application built with a React frontend and an Express backend. Users can register, log in, create posts with text or images, like posts, and add comments through a cookie-based authenticated flow.

## Features

- User registration and login
- Secure authentication with JWT stored in HTTP-only cookies
- Protected user session lookup with `/auth/me`
- Create posts with text and optional image upload
- Image upload support with Cloudinary
- Public feed showing the latest posts first
- Like and unlike posts
- Add comments to posts
- Frontend route protection for authenticated pages
- Request validation and centralized backend error handling

## Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM
- Material UI
- Axios

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Cloudinary
- Zod

## Project Structure

```text
Crowdly/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   └── pages/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── validators/
│   ├── server.js
│   └── package.json
└── README.md
```

## Frontend Overview

The frontend is a Vite-powered React app styled with Material UI.

Key responsibilities:

- Handles registration and login forms
- Manages the authenticated user with `AuthContext`
- Protects the `/home` route and redirects unauthenticated users
- Connects to the backend with Axios using `withCredentials: true`
- Shows the main feed, post creation form, and post interactions

Important frontend areas:

- `src/pages/RegisterPage.jsx`: user sign-up UI
- `src/pages/LoginPage.jsx`: user sign-in UI
- `src/pages/HomePage.jsx`: feed page for authenticated users
- `src/components/CreatePost.jsx`: create post with text/image
- `src/components/PostCard.jsx`: likes and comments UI
- `src/context/AuthContext.jsx`: auth state and session methods
- `src/lib/api.js`: shared API helper and base URL setup

## Backend Overview

The backend is an Express API connected to MongoDB with Mongoose.

Key responsibilities:

- Registers and authenticates users
- Issues JWT tokens in HTTP-only cookies
- Protects authenticated routes with middleware
- Stores users and posts in MongoDB
- Accepts image uploads through Multer memory storage
- Uploads images to Cloudinary
- Validates auth payloads with Zod
- Returns structured JSON errors through a central error handler

Important backend areas:

- `server.js`: app bootstrap, middleware, routes, and DB startup
- `src/controllers/authController.js`: register, login, logout, get current user
- `src/controllers/postController.js`: create posts, fetch feed, like, comment
- `src/routes/authRoutes.js`: auth endpoints
- `src/routes/postRoutes.js`: post endpoints
- `src/middleware/authMiddleware.js`: JWT cookie protection
- `src/middleware/uploadMiddleware.js`: image upload handling
- `src/models/User.js`: user schema
- `src/models/Post.js`: post schema

## API Endpoints

### Auth

- `POST /api/auth/register` - create a new account
- `POST /api/auth/login` - log in and set auth cookie
- `GET /api/auth/me` - get current authenticated user
- `POST /api/auth/logout` - clear auth cookie

### Posts

- `GET /api/posts` - fetch all posts
- `POST /api/posts` - create a post with text and optional image
- `PUT /api/posts/like/:id` - like or unlike a post
- `POST /api/posts/comment/:id` - add a comment to a post

## Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Optional frontend environment file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

### 2. Start the backend

```bash
cd backend
npm run dev
```

### 3. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend runs on `http://localhost:5000`.

## Authentication Flow

- User logs in with email and password
- Backend verifies credentials and signs a JWT
- JWT is stored in an HTTP-only cookie named `token`
- Frontend sends credentials automatically with each request
- Protected routes verify the cookie before returning user-specific actions

## Data Models

### User

- `username`
- `email`
- `password`
- `createdAt`
- `updatedAt`

### Post

- `user`
- `text`
- `image`
- `likes`
- `comments`
- `createdAt`
- `updatedAt`

## Notes

- Image uploads are limited to 5 MB and must be valid image files
- CORS is currently configured for `http://localhost:5173`
- Posts are sorted by newest first in the feed
- Registration requires a username, valid email, and password with at least 6 characters

## Future Improvements

- Delete and edit posts
- User profiles
- Better error and success toasts in the frontend
- Pagination or infinite scrolling
- Real-time updates
- Automated tests
- Deployment configuration for production
