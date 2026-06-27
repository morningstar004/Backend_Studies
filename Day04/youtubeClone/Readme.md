# YouTube Clone

A YouTube-style web application project with a Node.js + Express backend and a separate frontend. The backend is designed to handle API requests, manage MongoDB data models, and power the frontend UI.

## Features

- Video data management using MongoDB
- RESTful API endpoints for videos, users, and playlists
- Structured backend with controllers, models, routes, and middlewares
- Frontend served from a separate `frontend/` folder

## Tech Stack

- Node.js
- Express
- MongoDB / Mongoose
- Nodemon for development
- ES modules (`type": "module"`)

## Project Structure

- `backend/`
  - `src/`
    - `controllers/` - request handlers and business logic
    - `db/` - database connection utilities
    - `middlewares/` - request validation and error handling
    - `models/` - Mongoose schemas and data models
    - `routes/` - Express route definitions
    - `utils/` - shared helper functions
    - `app.js` - Express application setup
    - `index.js` - backend server entry point
    - `constants.js` - shared constants and configuration values
  - `.env` - environment variables for database and runtime settings
  - `package.json` - backend dependencies and scripts
- `frontend/` - frontend application code and assets

## Getting Started

### Prerequisites

- Node.js v18+ or compatible
- npm or yarn
- MongoDB instance (local or cloud)

### Backend Setup

1. Open a terminal in `backend/`
2. Install dependencies:

```bash
npm install
```

3. Create or update `.env` with your MongoDB connection settings, for example:

```env
MONGODB_URI=mongodb://localhost:27017/youtube-clone
PORT=4000
```

4. Start the backend server:

```bash
npm run dev
```

The backend should start on the port defined in `.env`.

## Frontend Setup

The frontend is located in the `frontend/` directory. Install dependencies and run the frontend from there using the tooling configured in that folder.

## Notes

- The backend uses a modular architecture to keep routes, controllers, models, and utilities separated.
- Update `backend/src/constants.js` and `backend/.env` with the correct values for your environment.
- If you add features, document new API routes and required environment variables here.

## Author

Pranjal Kumar

## License

ISC
