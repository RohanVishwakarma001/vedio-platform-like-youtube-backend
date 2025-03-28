import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import { updateVideo, uploadVideo } from "../controllers/video.controller.js";

const router = express.Router();

/// 👉 @desc    Upload video
/// 👉 @route   POST /api/videos/upload
router.post("/upload", auth, uploadVideo);

/// 👉 @desc    Update Video (No video update, only Meta Data will update)
/// 👉 @route   PUT /api/videos/:id

router.put("/update/:id", auth, updateVideo);

export default router;
