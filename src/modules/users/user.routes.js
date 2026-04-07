import { Router } from "express";
import { signupUserController, signinUserController, getUserById } from "./user.controller.js";
import { authMiddleware } from "../auth/auth.js";

const router = Router();

// User signup route
router.post("/signup", signupUserController);

// User signin route
router.post("/signin", signinUserController);

// Get user by ID route (protected)
router.get("/:id", authMiddleware, getUserById);

export default router;