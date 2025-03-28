import mongoose from "mongoose";

import cloudinary from "../config/cloudinary.config.js";
import User from "../models/user.model.js";
import Video from "../models/video.model.js";

export const uploadVideo = async (req, res) => {
  const { title, description, category, tags } = req.body;

  try {
    if (!title || !description || !category) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    if (!req.files || !req.files.videoUrl || !req.files.thumbnailUrl) {
      return res
        .status(400)
        .json({ message: "Please upload a video and thumbnail" });
    }

    const vedioUpload = await cloudinary.uploader.upload(
      req.files.videoUrl.tempFilePath,
      { resource_type: "video", folder: "videos/" }
    );
    const thumbnailUpload = await cloudinary.uploader.upload(
      req.files.thumbnailUrl.tempFilePath,
      { folder: "thumbnails/" }
    );

    const newVideo = new Video({
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      category,
      tags: tags ? tags.split(",") : [],
      videoUrl: vedioUpload.secure_url,
      videoId: vedioUpload.public_id,
      thumbnailUrl: thumbnailUpload.secure_url,
      thumbnailId: thumbnailUpload.public_id,
      user_id: req.user._id,
    });

    const video = await newVideo.save();
    await User.findByIdAndUpdate(req.user._id, {
      $push: { videos: video._id },
    });

    res.status(201).json({ message: "Video uploaded successfully", video });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
