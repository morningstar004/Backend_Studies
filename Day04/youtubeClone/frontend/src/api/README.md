# Frontend API guide

This folder is the boundary between the React interface and the Express backend. Pages and components should call the small functions here instead of calling `fetch` directly.

## The request path

`apiClient.js` is the shared HTTP client. It joins `VITE_API_BASE_URL`(normally `/api/v1`) with a route such as `/users/login`. With the example environment file, that becomes `/api/v1/users/login`.

In development, Vite receives that `/api` request and forwards it to `VITE_API_PROXY_TARGET` (normally `http://localhost:9000`). This avoids browser CORS problems. In production, set `VITE_API_BASE_URL` to the public API URL and set the backend's `FRONTEND_URL` to the deployed frontend URL.

## How a request moves through the app

`Login.jsx` → `AuthContext.jsx` → `authApi.js` → `apiClient.js` → `backend/src/routes/user.route.js` → controller → MongoDB.

The backend returns successful responses shaped like `{ success, statusCode, message, data }` and errors shaped like `{ success: false, statusCode, message, errors }`. Use `response.data` for the actual resource; `response.message` is suitable for user feedback. The shared client throws the backend message so pages can show a useful error instead of a generic request failure.

## Authentication

After login, the backend sets HTTP-only `accessToken` and `refreshToken` cookies. `apiClient.js` uses `credentials: 'include'`, which tells the browser to send those cookies with future API calls. JavaScript cannot read HTTP-only cookies; that is deliberate. `AuthContext` learns who is signed in by calling `/users/current-user`.

For cookies to work across different origins, the backend must allow the frontend origin through `FRONTEND_URL` and CORS must keep `credentials: true`.

## Adding an endpoint

1. Add the Express route and controller in `backend/src`.
2. Add a descriptive function to the relevant frontend API file (for example, `authApi.js`).
3. Call that function from the page or a React Query hook.
4. Handle loading, success, and error states in the UI.

Avoid placing API URLs in pages. Keeping them here makes a later route change a one-line update.
