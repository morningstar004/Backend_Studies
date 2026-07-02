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


// Routes
app.get("/", (req, res) => {
    res.send("API is running...");
});


export default app;