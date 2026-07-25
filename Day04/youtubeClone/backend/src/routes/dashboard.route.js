import { Router } from "express";
import {} from "../controllers/dashboard.controller"
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("./")