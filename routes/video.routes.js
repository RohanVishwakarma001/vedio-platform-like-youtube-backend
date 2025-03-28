import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import { uploadVideo } from "../controllers/video.controller.js";

const router = express.Router();

router.post("/upload", auth, uploadVideo);

export default router;
