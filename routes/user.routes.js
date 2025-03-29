import express from "express";
import { login, logout, signup } from "../controllers/user.controller.js";

const router = express.Router();

/// 👉 @desc    Signup
/// 👉 @route   POST /api/user/signup
router.post("/signup", signup);

/// 👉 @desc    Login
/// 👉 @route   POST /api/user/login
router.post("/login", login);

/// 👉 @desc    Logout
/// 👉 @route   POST /api/user/logout
router.post("/logout", logout);

export default router;
