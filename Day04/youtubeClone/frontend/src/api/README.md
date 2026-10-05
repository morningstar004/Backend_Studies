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

For a Vercel frontend calling a Render API, configure:

- Vercel `VITE_API_BASE_URL` as the full Render API URL ending in `/api/v1` (for example, `https://your-service.onrender.com/api/v1`), then redeploy so the value is included in the frontend build.
- Render `FRONTEND_URL` as the exact Vercel origin (for example, `https://your-app.vercel.app`), without a path. Separate additional custom or preview origins with commas.
- Render `NODE_ENV=production` (Render also identifies its runtime through `RENDER=true`).

The API permits credentialed CORS only for configured origins. In production, auth cookies use `SameSite=None; Secure` so cross-site requests can send them over HTTPS; locally they use `SameSite=Lax`. If the browser blocks third-party cookies for the separate Vercel and Render domains, use custom frontend/API domains under the same site (for example, `app.example.com` and `api.example.com`) or a same-origin API proxy.

All API requests other than `GET`, `HEAD`, and `OPTIONS` require both a configured trusted `Origin` and a signed double-submit CSRF token. Before a state-changing request, the central API client obtains a token from `GET /api/v1/csrf-token`, sends it in `X-CSRF-Token`, and the backend checks it against the signed `csrfToken` cookie. That cookie is `HttpOnly=false`, `Secure` and `SameSite=None` in production, scoped to `/api/v1`, and has no broad `Domain` attribute. Since browser JavaScript on `safroon.vercel.app` cannot read a cookie scoped to `youtubeclone-fqh5.onrender.com`, the bootstrap endpoint returns the same token in a no-store JSON response; the client keeps it in memory, not local storage. The CSRF signing secret is server-only.

Set Vercel `VITE_API_BASE_URL` to `https://youtubeclone-fqh5.onrender.com/api/v1`. Set Render `FRONTEND_URL` to `https://safroon.vercel.app`, `NODE_ENV=production`, and `CSRF_SECRET` to a separate cryptographically random value of at least 32 bytes. Do not configure `CSRF_SECRET` as a `VITE_*` variable. Keep the existing JWT, database, and other backend secrets on Render only. For local development, configure `FRONTEND_URL` with the exact local frontend origin; the backend uses `ACCESS_TOKEN_SECRET` as the CSRF signing key only when not in production and `CSRF_SECRET` is absent.

`helmet` is not installed. The API adds `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: no-referrer`, and disables Express's `X-Powered-By` header. A Content Security Policy is not set here because the frontend is hosted separately and the API also serves static files.

## Adding an endpoint

1. Add the Express route and controller in `backend/src`.
2. Add a descriptive function to the relevant frontend API file (for example, `authApi.js`).
3. Call that function from the page or a React Query hook.
4. Handle loading, success, and error states in the UI.

Avoid placing API URLs in pages. Keeping them here makes a later route change a one-line update.
