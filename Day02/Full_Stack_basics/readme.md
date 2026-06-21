**Full Stack Basics**

A small, opinionated example showing how a React frontend (built with Vite) connects to an Express backend. This repo demonstrates local development setup, simple API consumption, handling CORS with a dev proxy, and basic production build guidance.

**Highlights**
- Clear frontend / backend separation
- Vite-powered React app with Axios for API requests
- Lightweight Express server exposing a JSON endpoint
- Guidance for local dev, proxying, and production build

**Project Structure**
- frontend/ — Vite + React application
- backend/  — Express API server

**Tech Stack**
- Frontend: React, Vite, Axios
- Backend: Node.js, Express

Prerequisites
- Node.js 16+ and npm

Quick Start (development)

1) Install dependencies

```bash
# from repository root
cd "Day02/Full_Stack_basics/backend"
npm install

cd "Day02/Full_Stack_basics/frontend"
npm install
```

2) Run backend and frontend (two terminals)

```bash
# Terminal 1 — backend
cd "Day02/Full_Stack_basics/backend"
npm run start    # or `node server.js` depending on package scripts

# Terminal 2 — frontend (Vite)
cd "Day02/Full_Stack_basics/frontend"
npm run dev
```

- Backend default: http://localhost:5000
- Frontend default: http://localhost:5173

API / Data
- GET /api/jokes — returns a JSON array of jokes (example endpoint used by the frontend). Adjust the path in the frontend if your backend uses a different route.

CORS and Proxying
- During development the frontend runs on a different port than the API. To avoid CORS errors, the frontend uses a Vite dev proxy (configured in `vite.config.js`) so client requests like `/api/*` are forwarded to the backend.

Production build & deploy
- Build the frontend: `npm run build` in `frontend/` -> produces `dist/`.
- Serve statics: you can host `dist/` on a static file host (Netlify, Vercel, S3) or have the backend serve it with `express.static(dist)` for a single-server deployment. For many team workflows, serving the frontend from a dedicated static host (and keeping the API separate) is preferable.

Folder quick reference

- Day02/Full_Stack_basics/frontend — React app sources, `npm run dev`, `npm run build`
- Day02/Full_Stack_basics/backend  — Express server, API routes

Contributing
- Improvements, bug fixes, or examples (e.g., authentication, tests) are welcome. Open a PR or issue describing the change.

License
- This repo is provided for learning/demo purposes. Add a license file if you intend to publish or share.