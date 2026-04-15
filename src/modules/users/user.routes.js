import { Router } from "express";
import {
  signupUserController,
  signinUserController,
  getUserById,
  updateUserProfileController,
  changePasswordController,
} from "./user.controller.js";
import { authMiddleware } from "../auth/auth.js";

const router = Router();

// User signup route
router.post("/signup", signupUserController);

// User signin route
router.post("/signin", signinUserController);

// Change password (protected) — must come before /:id so it doesn't match as an id
router.post("/change-password", authMiddleware, changePasswordController);

// Get user by ID (protected)
router.get("/:id", authMiddleware, getUserById);

// Update user profile (protected)
router.put("/:id", authMiddleware, updateUserProfileController);

export default router;