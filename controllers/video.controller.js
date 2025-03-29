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

export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (video.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized" });
    }

    // Delete video from Cloudinary
    await cloudinary.uploader.destroy(video.videoId, {
      resource_type: "video",
    });
    // Delete thumbnail from Cloudinary
    await cloudinary.uploader.destroy(video.thumbnailId, {
      resource_type: "thumbnails/",
    });
    // Delete video from database
    await video.remove();
    // Remove video reference from user
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { videos: video._id },
    });
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find({}).populate("user_id");
    res.status(200).json({ videos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate("user_id");
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.status(200).json({ video });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMyVideos = async (req, res) => {
  try {
    const videos = await Video.find({ user_id: req.user._id }).populate(
      "user_id"
    );
    res.status(200).json({ videos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getVideoByCategory = async (req, res) => {
  try {
    const videos = await Video.find({ category: req.params.category }).populate(
      "user_id"
    );
    res.status(200).json({ videos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
export const getVideoByTag = async (req, res) => {
  try {
    const videos = await Video.find({ tags: req.params.tag }).populate(
      "user_id"
    );
    res.status(200).json({ videos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const searchVideos = async (req, res) => {
  try {
    const videos = await Video.find({
      $or: [
        { title: { $regex: req.params.query, $options: "i" } },
        { description: { $regex: req.params.query, $options: "i" } },
        { tags: { $regex: req.params.query, $options: "i" } },
      ],
    }).populate("user_id");
    res.status(200).json({ videos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
export const getVideoByUser = async (req, res) => {
  try {
    const videos = await Video.find({ user_id: req.params.userId }).populate(
      "user_id"
    );
    res.status(200).json({ videos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getLikedVideos = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    if (video.likes.includes(req.user._id)) {
      return res.status(400).json({ message: "You already liked this video" });
    }
    video.likes.push(req.user._id);
    await video.save();
    res.status(200).json({ message: "Video liked successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getDislikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    if (!video.likes.includes(req.user._id)) {
      return res.status(400).json({ message: "You have not liked this video" });
    }
    video.likes = video.likes.filter(
      (like) => like.toString() !== req.user._id
    );
    await video.save();
    res.status(200).json({ message: "Video disliked successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const addComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    const { text } = req.body;
    video.comments.push({ user_id: req.user._id, text });
    await video.save();
    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    video.comments = video.comments.filter(
      (comment) => comment._id.toString() !== req.params.commentId
    );
    await video.save();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
