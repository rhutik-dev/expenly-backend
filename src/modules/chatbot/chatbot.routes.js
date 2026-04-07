import { Router } from "express";
import { chatController, healthController } from "./chatbot.controller.js";
import { authMiddleware } from "../auth/auth.js";

const router = Router();

/**
 * POST /api/chatbot/chat - Send a message to the chatbot (authenticated)
 */
router.post("/chat", authMiddleware, chatController);

/**
 * GET /api/chatbot/health - Health check (public)
 */
router.get("/health", healthController);

export default router;
