import { Router } from "express";
import { getAllTagsController, createTagController, deleteTagController } from "./tag.controller.js";
import { authMiddleware, requireRole } from "../auth/auth.js";

const router = Router();

/**
 * GET /api/tags - Get all tags (authenticated users)
 */
router.get("/", authMiddleware, getAllTagsController);

/**
 * POST /api/tags - Create a new tag (admin only)
 */
router.post("/", authMiddleware, requireRole("ADMIN"), createTagController);

/**
 * DELETE /api/tags/:id - Delete a tag (admin only)
 */
router.delete("/:id", authMiddleware, requireRole("ADMIN"), deleteTagController);

export default router;
