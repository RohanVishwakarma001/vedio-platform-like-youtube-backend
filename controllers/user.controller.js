import bcrypt from "bcrypt";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.config.js";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
  const { channelName, email, phone, password } = req.body;
  try {
    if (!channelName || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const uploadImage = await cloudinary.uploader.upload(
      req.files.logoUrl.tempFilePath
    );

    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      channelName,
      email,
      phone,
      password: hashedPassword,
      logoUrl: uploadImage.secure_url,
      logId: uploadImage.public_id,
    });

    const user = await newUser.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
