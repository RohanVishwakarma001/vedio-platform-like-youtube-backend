import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getMyVideos,
  getVideoById,
  updateVideo,
  uploadVideo,
} from "../controllers/video.controller.js";

const router = express.Router();

/// 👉 @desc    Upload video
/// 👉 @route   POST /api/videos/upload
router.post("/upload", auth, uploadVideo);

/// 👉 @desc    Update Video (No video update, only Meta Data will update)
/// 👉 @route   PUT /api/videos/:id

router.put("/update/:id", auth, updateVideo);

/// 👉 @desc    Delete Video
/// 👉 @route   DELETE /api/videos/:id

router.delete("/delete/:id", auth, deleteVideo);

/// 👉 @desc    Get all videos
/// 👉 @route   GET /api/videos

router.get("/all-videos", getAllVideos);

/// 👉 @desc    Get Video by ID
/// 👉 @route   GET /api/videos/:id

router.get("/:id", auth, getVideoById);

/// 👉 @desc    Get Video by My Video
/// 👉 @route   GET /api/videos/my-videos
router.get("/my-videos", auth, getMyVideos);

export default router;
