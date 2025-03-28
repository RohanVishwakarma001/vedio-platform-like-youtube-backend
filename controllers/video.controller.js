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

export const updateVideo = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (video.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized" });
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.category = category || video.category;
    video.tags = tags ? tags.split(",") : [] || video.tags;
    if (req.files && req.files.thumbnailUrl) {
      // Delete old thumbnail from Cloudinary
      await cloudinary.uploader.destroy(video.thumbnailId, {
        resource_type: "thumbnails/",
      });
      // Upload new thumbnail to Cloudinary

      const thumbnailUpload = await cloudinary.uploader.upload(
        req.files.thumbnailUrl.tempFilePath,
        { folder: "thumbnails/" }
      );
      video.thumbnailUrl = thumbnailUpload.secure_url;
      video.thumbnailId = thumbnailUpload.public_id;
    }
    await video.save();
    res.status(200).json({ message: "Video updated successfully", video });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
