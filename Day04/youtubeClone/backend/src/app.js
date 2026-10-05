import express from "express";
import cors from "cors";
import cookieParse from "cookie-parser";
import { apiError } from "./utils/apiError.js";
import {
  createCsrfToken,
  csrfCookieName,
  csrfCookieOptions,
  createCsrfProtection,
} from "./middlewares/csrf.middleware.js";

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
const isTrustedOrigin = (origin) =>
  typeof origin === "string" && allowedOrigins.includes(origin);

// Middleware
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("X-Frame-Options", "DENY");
  res.set("Referrer-Policy", "no-referrer");
  next();
});
app.use(
  express.json({
    limit: "10kb",
  }),
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);
app.use(express.static("public", {}));

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isTrustedOrigin(origin));
    },
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
    credentials: true,
    optionsSuccessStatus: 204,
  }),
);
app.use(cookieParse());

app.get("/api/v1/csrf-token", (req, res, next) => {
  if (!isTrustedOrigin(req.get("Origin"))) {
    return next(new apiError(403, "Untrusted or missing Origin."));
  }

  const csrfToken = createCsrfToken();
  return res
    .set("Cache-Control", "no-store")
    .cookie(csrfCookieName, csrfToken, csrfCookieOptions)
    .status(200)
    .json({
      success: true,
      statusCode: 200,
      message: "CSRF token issued.",
      data: { csrfToken },
    });
});

app.use("/api/v1", createCsrfProtection(isTrustedOrigin));

//Importing routers
import { userRouter } from "./routes/user.route.js";
import { commentsRouter } from "./routes/comments.route.js";
import { likeRouter } from "./routes/like.route.js";
import { playlistRouter } from "./routes/playlist.route.js";
import { subscriptionRouter } from "./routes/subscription.route.js";
import { tweetsRouter } from "./routes/tweets.route.js";
import { videoRouter } from "./routes/video.route.js";
import { dashboardRouter } from "./routes/dashboard.route.js";

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/tweets", tweetsRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const knownApiError = Number.isInteger(error.statusCode);
  const statusCode = knownApiError
    ? error.statusCode
    : Number.isInteger(error.status) && error.status >= 400 && error.status < 600
      ? error.status
      : 500;
  const message =
    knownApiError || statusCode < 500
      ? error.message
      : "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: message || "Internal Server Error",
    errors: Array.isArray(error.errors) ? error.errors : [],
  });
});

export default app;
