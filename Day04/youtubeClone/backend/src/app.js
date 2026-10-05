import express from "express";
import cors from "cors";
import cookieParse from "cookie-parser";

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Middleware
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
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);
app.use(cookieParse());

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
