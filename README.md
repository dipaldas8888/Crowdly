# Crowdly · Modern Full-Stack Social Networking Platform

Crowdly is a full-stack, real-time social networking application built with **React 19**, **Node.js/Express 5**, **MongoDB**, **Socket.IO**, and **Tailwind CSS**. It delivers a rich, interactive user experience with real-time messaging, stories, group communities, post bookmarking, notifications, and media sharing.

---

## ✨ Features Breakdown

### 🔐 Authentication & Security
- **OTP Email Verification**: 6-digit email OTP for secure registration and password reset flows using Nodemailer.
- **JWT HTTP-Only Cookies**: Secure session management utilizing HTTP-only, SameSite cookies to protect against XSS attacks.
- **Privacy Settings**: Granular user privacy preferences (control who can message, follow, comment, tag, or mention).
- **Zod Validation**: Strict request payload schema validation on all incoming API data.

### 📰 Dynamic Feed & Post Management
- **Rich Post Creation**: Share text, images (Cloudinary integration), location check-ins, and tag friends.
- **Post Reposting / Sharing**: Repost existing content with personalized captions and automatic share counter tracking.
- **Multi-Level Comments & Replies**: Nested comment threads with likes, replies, and author authorization rules.
- **Optimistic UI Updates**: Instant visual feedback for likes, comments, and post actions before API resolution.

### 🔖 Saved Posts & Bookmarks
- **Bookmark Content**: Save any post to a personal collection with one click.
- **Dedicated `/saved` Page**: Filter and search through bookmarked posts by text, author username, or location.

### 📖 Interactive Stories System
- **24-Hour Ephemeral Stories**: Post visual stories that automatically expire after 24 hours.
- **Interactive Story Viewer**: Fullscreen modal with progress indicators, user navigation, and viewer analytics.

### 👥 Groups & Communities
- **Community Hub**: Discover public/private groups or launch custom communities with cover media and privacy rules.
- **Group Feeds**: Filter feed content by joined groups and manage group memberships.

### 💬 Real-Time Messaging & Presence
- **Socket.IO Chat**: Instant 1-on-1 messaging with live unread counts, typing indicators, and message history.
- **Online Presence**: Live status badges showing active friends and real-time socket connection tracking.

### 🔔 Notification Engine
- **Activity Alerts**: Real-time notifications for likes, comments, shares, and friend requests.
- **Interactive Dropdown**: Mark notifications as read, view timestamps, and jump directly to relevant content.

### 🎥 Watch & Video Hub
- **Video Sharing**: Dedicated video page for exploring short-form and long-form video content with streaming playback.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Material-UI (MUI) Theme Engine
- **Icons**: Lucide React
- **Routing**: React Router DOM v7 (SPA routing with code-splitting via `lazy` & `Suspense`)
- **Real-Time Data**: Socket.io-client
- **Toasts & Feedback**: React Toastify

### Backend
- **Runtime**: Node.js v24
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ORM
- **Real-Time Engine**: Socket.IO
- **File & Media Storage**: Cloudinary + Multer
- **Email Service**: Nodemailer
- **Validation & Auth**: Zod, JSON Web Tokens (JWT), bcryptjs

---

## 📁 Project Architecture

```text
Crowdly/
├── frontend/                     # React Frontend App
│   ├── public/                   # Static assets & favicon
│   ├── src/
│   │   ├── components/           # Navbar, LeftSidebar, RightSidebar, PostCard, Stories, MobileNav, etc.
│   │   ├── context/              # AuthContext, SocketContext, NotificationContext
│   │   ├── lib/                  # Shared API client & helpers
│   │   ├── pages/                # HomePage, ProfilePage, SavedPage, GroupsPage, WatchPage, MessagesPage, etc.
│   │   ├── App.jsx               # Route definitions & app shell
│   │   └── main.jsx              # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js Express API Server
│   ├── src/
│   │   ├── config/               # Cloudinary & MongoDB configurations
│   │   ├── controllers/          # Auth, Post, Group, Story, Message, Friend, Notification controllers
│   │   ├── middleware/           # JWT Auth, Multer File Upload, Error Handler
│   │   ├── models/               # Mongoose Schemas (User, Post, Group, Story, Message, OTP, Notification)
│   │   ├── routes/               # Express API Routes
│   │   ├── socket/               # Real-time Socket.IO handler
│   │   ├── utils/                # Email sender, JWT generator, custom API error handler
│   │   └── validators/           # Zod schema validators
│   ├── server.js                 # Express server bootstrap & Socket.IO server creation
│   └── package.json
│
└── README.md
```

---

## 🔌 Key API Endpoints

### 🔑 Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/send-register-otp` | Dispatch 6-digit OTP to user email |
| `POST` | `/api/auth/verify-otp-register` | Verify OTP and create user account |
| `POST` | `/api/auth/login` | Authenticate user & issue HTTP-only cookie |
| `GET` | `/api/auth/me` | Fetch authenticated user session |
| `POST` | `/api/auth/forgot-password` | Dispatch password reset OTP |
| `POST` | `/api/auth/reset-password` | Reset password using OTP code |
| `POST` | `/api/auth/logout` | Revoke session cookie |

### 📝 Posts & Bookmarks
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/posts` | Fetch paginated feed posts |
| `POST` | `/api/posts` | Create new post with media/location/tags |
| `PUT` | `/api/posts/like/:id` | Toggle like on post |
| `POST` | `/api/posts/comment/:id` | Add comment to post |
| `POST` | `/api/posts/:id/save` | Toggle save/bookmark post |
| `GET` | `/api/posts/saved` | Fetch all saved posts for user |
| `POST` | `/api/posts/share/:id` | Repost content to user feed |

### 📖 Stories & Groups
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/stories` | Fetch active (24h) stories |
| `POST` | `/api/stories` | Upload new story media |
| `GET` | `/api/groups` | List communities |
| `POST` | `/api/groups` | Create new group community |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB instance (Local or MongoDB Atlas)
- Cloudinary Account (for image/video uploads)

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/crowdly
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend server:
```bash
npm run dev
```
Open `http://localhost:5173` (or port indicated by Vite) in your browser.

---

## 🌐 Deployment

- **Frontend**: Deployed on **Vercel** with single-page app (SPA) rewrite rules in `vercel.json`.
- **Backend**: Deployed on **Render** / **Railway** with Cloudinary media CDN integration and MongoDB Atlas database clustering.
