import express from "express";
import cors from "cors";
import cookieParse from "cookie-parser";

const app = express();

// Middleware
app.use(express.json({
    limit: "10kb",
}));
app.use(express.urlencoded({
    extended: true,
    limit: "10kb",
}))
app.use(express.static("public", {}))

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(cookieParse());

//Importing routers
import { userRouter } from "./routes/user.route.js"

// Routes
app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use("/api/v1/users", userRouter);


export default app;