import { Router } from "express";
import { addExpenseController, getExpensesController, updateExpenseController, deleteExpenseController } from "./expenses.controller.js";
import { authMiddleware } from "../auth/auth.js";

const router = Router();

/**
 * GET /api/expenses - Get all expenses for authenticated user
 */
router.get("/", authMiddleware, getExpensesController);

/**
 * POST /api/expenses - Add a new expense for authenticated user
 */
router.post("/", authMiddleware, addExpenseController);

/**
 * PUT /api/expenses/:id - Update an expense (own expenses only)
 */
router.put("/:id", authMiddleware, updateExpenseController);

/**
 * DELETE /api/expenses/:id - Delete an expense (own expenses only)
 */
router.delete("/:id", authMiddleware, deleteExpenseController);

export default router;
