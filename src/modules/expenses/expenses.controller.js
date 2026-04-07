import { sendResponse } from "../../utils/response.js";
import { createExpense, getExpensesByUserId, updateExpense, deleteExpense } from "./expenses.service.js";

/**
 * Controller for adding an expense record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const addExpenseController = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return sendResponse(res, 400, false, "Expense data is required");
        }

        const { title, amount, currency, notes, expenseDate, tagId } = req.body;
        const userId = req.user.id;

        const result = await createExpense({
            title,
            amount,
            currency,
            notes,
            expenseDate,
            userId,
            tagId,
        });

        if (!result.success) {
            return sendResponse(res, 400, false, result.message, null, { errors: result.errors });
        }

        return sendResponse(res, 201, true, "Expense record added successfully", result.data);
    } catch (error) {
        console.error("Error in add expense controller:", error.message);
        return sendResponse(res, 500, false, "Internal server error");
    }
};

/**
 * Controller for getting expenses for authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getExpensesController = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await getExpensesByUserId(userId);

        if (!result.success) {
            return sendResponse(res, 404, false, result.message);
        }

        return sendResponse(res, 200, true, "Expenses fetched successfully", result.data);
    } catch (error) {
        console.error("Error in get expenses controller:", error.message);
        return sendResponse(res, 500, false, "Internal server error");
    }
};

/**
 * Controller for updating an expense
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateExpenseController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!req.body || Object.keys(req.body).length === 0) {
            return sendResponse(res, 400, false, "Update payload is required");
        }

        const { title, amount, currency, notes, expenseDate, tagId } = req.body;

        const result = await updateExpense(id, userId, {
            title,
            amount,
            currency,
            notes,
            expenseDate,
            tagId,
        });

        if (!result.success) {
            const statusCode = result.message.includes("not found") ? 404 : 400;
            return sendResponse(res, statusCode, false, result.message);
        }

        return sendResponse(res, 200, true, "Expense updated successfully", result.data);
    } catch (error) {
        console.error("Error in update expense controller:", error.message);
        return sendResponse(res, 500, false, "Internal server error");
    }
};

/**
 * Controller for deleting an expense
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteExpenseController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await deleteExpense(id, userId);

        if (!result.success) {
            const statusCode = result.message.includes("not found") ? 404 : 403;
            return sendResponse(res, statusCode, false, result.message);
        }

        return sendResponse(res, 200, true, "Expense deleted successfully");
    } catch (error) {
        console.error("Error in delete expense controller:", error.message);
        return sendResponse(res, 500, false, "Internal server error");
    }
};