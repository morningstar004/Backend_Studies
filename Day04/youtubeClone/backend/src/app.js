import express from "express";
import cors from "cors";
import cookieParse from "cookie-parser";

const app = express();

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
    origin: process.env.FRONTEND_URL,
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

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("/api/v1/comments", likeRouter);
app.use("/api/v1/platylist", playlistRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/tweets", tweetsRouter);
app.use("/api/v1/video", videoRouter);

export default app;
