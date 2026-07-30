# YouTube Clone

A YouTube-style web application with a Node.js + Express backend and a separate frontend. The backend provides a REST API for video publishing, user accounts, comments, likes, playlists, subscriptions, tweets, and channel analytics.

## 🚀 Project Features

- User authentication and session management
- Video upload, thumbnail storage, and publish controls
- Comment creation, editing, deletion, and comment likes
- Playlist creation, update, delete, and video management
- Channel subscriptions and subscriber lists
- User watch history retrieval
- Channel dashboard stats and channel videos
- Tweet-like posts with create, update, delete, and user feeds
- Multer file uploads and Cloudinary media support
- Centralized error handling and protected routes

## 🧩 Reader-Facing API Routes

Base URL: `/api/v1`

- `GET /users/current-user`
- `GET /users/c/:username`
- `GET /users/history`
- `GET /comments/:videoId/getComments`
- `GET /likes/getLikedVideos`
- `GET /playlists/:userId/getUserPlaylists`
- `GET /playlists/:playlistId/getPlaylistById`
- `GET /subscription/:channelId/subscribers`
- `GET /subscription/:subscriberId/subscriptions`
- `GET /tweets/getUserTweets/:userId`
- `GET /video/getAllVideos`
- `GET /video/getVideoById`
- `GET /dashboard/stats`
- `GET /dashboard/videos`


## 🔧 How the backend works

The backend is built with Express and exposes a modular API under `/api/v1`. `backend/src/app.js` configures JSON parsing, URL-encoded body parsing, CORS, cookie handling, static file delivery, and route registration. Each domain area lives in its own routes and controllers folder, while Mongoose models and database connection logic are managed in `backend/src/db`. Protected routes use JWT validation middleware, and file uploads are handled by Multer before controller logic executes. `backend/src/index.js` loads environment variables, connects to MongoDB, and starts the server on the configured port.

## 🛠️ Backend Setup

1. Navigate to `backend/`
2. Run `npm install`
3. Configure `.env` with `MONGODB_URI`, `PORT`, and `FRONTEND_URL`
4. Start the backend with `npm run dev`

## 📁 Structure

- `backend/src/` contains controllers, models, routes, middleware, and utilities.
- `frontend/` contains the client-side React/Vite application.

## 📄 License

ISC
