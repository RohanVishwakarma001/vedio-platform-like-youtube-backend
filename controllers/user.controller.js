import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import cloudinary from "../config/cloudinary.config.js";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
  const { channelName, email, phone, password } = req.body;
  try {
    if (!channelName || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
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
      logoId: uploadImage.public_id,
    });

    const user = await newUser.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
        channelName: user.channelName,
        logoId: user.logoId,
        phone: user.phone,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      message: "Login successful",
      email: user.email,
      id: user._id,
      channelName: user.channelName,
      logoId: user.logoId,
      phone: user.phone,
      logoUrl: user.logoUrl,
      subscribers: user.subscribers,
      subscribedChannels: user.subscribedChannels,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
