# YouTube Clone

A YouTube-style web application with a Node.js + Express backend and a separate frontend. The backend serves REST APIs, manages MongoDB data models, and supports the frontend UI.

## 🚀 What this project includes

- Video, user, and playlist management
- RESTful backend endpoints
- MongoDB + Mongoose data modeling
- Modular Express architecture
- Request validation and centralized error handling
- Separate `frontend/` app for UI

## 🧰 Tech Stack

- Node.js
- Express
- MongoDB / Mongoose
- dotenv
- Nodemon
- ES Modules

## 📁 Project Structure

- `backend/`
  - `src/`
    - `controllers/` - request handlers and business logic
    - `db/` - database connection utilities
    - `middlewares/` - validation, authentication, and error handling
    - `models/` - Mongoose schemas
    - `routes/` - Express routes
    - `utils/` - helper functions
    - `app.js` - Express application setup
    - `index.js` - backend server entry point
    - `constants.js` - shared configuration values
  - `.env` - runtime and database configuration
  - `package.json` - dependencies and scripts
- `frontend/` - frontend application code and assets

## 🎯 Key Features

- CRUD operations for videos, users, and playlists
- Token-based authentication support
- File upload handling via Multer
- Cloudinary integration for media storage
- Centralized error responses

## 🛠️ Backend Setup

1. Open a terminal in `backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create or update `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/youtube-clone
   PORT=4000
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

The backend will start on the port defined in `.env`.

## 📌 Notes

- The backend uses a modular structure to keep controllers, routes, models, and middleware separate.
- Keep `backend/src/constants.js` and `backend/.env` updated for your environment.
- Document new routes and environment variables when adding features.

## 💡 Recommended workflow

- Update backend logic in `backend/src/`
- Keep frontend changes inside `frontend/`
- Use Postman or a browser to test API endpoints
- Add new routes under `backend/src/routes/`

## 🙋‍♂️ Author

Pranjal Kumar

## 📄 License

ISC
