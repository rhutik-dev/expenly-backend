import prisma from "../../config/db.js";
import { z } from "zod";
import { formatResponse } from "../../utils/response.js";

/**
 * Validation schema for expense creation
 */
const createExpenseSchema = z.object({
    title: z.string().min(1, "Title is required"),
    amount: z.union([z.number(), z.string().transform(Number)]).refine(val => val > 0, "Amount must be positive"),
    currency: z.string().optional().default("INR"),
    notes: z.string().optional(),
    expenseDate: z.string().or(z.date()).transform(val => new Date(val)),
    userId: z.string().uuid("Invalid user ID"),
    tagId: z.string().uuid("Invalid tag ID").optional(),
});

/**
 * Create a new expense record
 * @param {Object} expenseData - Expense data
 * @returns {Promise<Object>} - Created expense record
 */
export const createExpense = async (expenseData) => {
    try {
        // Validate input data
        const validatedData = createExpenseSchema.parse(expenseData);

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: validatedData.userId },
        });

        if (!user) {
            return formatResponse(false, "User not found");
        }

        // Check if tag exists if provided
        if (validatedData.tagId) {
            const tag = await prisma.tag.findUnique({
                where: { id: validatedData.tagId },
            });

            if (!tag) {
                return formatResponse(false, "Tag not found");
            }
        }

        // Create expense in database
        const expense = await prisma.expense.create({
            data: {
                title: validatedData.title,
                amount: validatedData.amount,
                currency: validatedData.currency,
                notes: validatedData.notes,
                expenseDate: validatedData.expenseDate,
                user: { connect: { id: validatedData.userId } },
                ...(validatedData.tagId && { tag: { connect: { id: validatedData.tagId } } }),
            },
            include: {
                tag: true
            }
        });

        return formatResponse(true, "Expense record added successfully", expense);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return formatResponse(false, "Validation failed", null, {
                errors: error.errors.map((e) => e.message),
            });
        }
        console.error("Error creating expense:", error.message);
        throw error;
    }
};

/**
 * Get all expenses for a user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User's expenses
 */
export const getExpensesByUserId = async (userId) => {
    try {
        if (!userId) {
            return formatResponse(false, "User ID is required");
        }

        const expenses = await prisma.expense.findMany({
            where: { userId },
            include: {
                tag: true,
            },
            orderBy: { expenseDate: "desc" },
        });

        return formatResponse(true, "Expenses fetched successfully", expenses);
    } catch (error) {
        console.error("Error fetching expenses by user ID:", error.message);
        throw error;
    }
};

/**
 * Get all expenses for a user by email (deprecated, kept for backward compatibility)
 * @param {string} email - User email
 * @returns {Promise<Object>} - User's expenses
 */
export const getExpensesByEmail = async (email) => {
    try {
        if (!email) {
            return formatResponse(false, "Email is required");
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                expenses: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        if (!user) {
            return formatResponse(false, "User not found");
        }

        return formatResponse(true, "Expenses fetched successfully", user.expenses);
    } catch (error) {
        console.error("Error fetching expenses by email:", error.message);
        throw error;
    }
};

/**
 * Update an expense (owner only)
 * @param {string} expenseId - Expense ID
 * @param {string} userId - User ID (for ownership check)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated expense
 */
export const updateExpense = async (expenseId, userId, updateData) => {
    try {
        // Validate user owns this expense
        const expense = await prisma.expense.findUnique({
            where: { id: expenseId },
        });

        if (!expense) {
            return formatResponse(false, "Expense not found");
        }

        if (expense.userId !== userId) {
            return formatResponse(false, "Access denied: you can only update your own expenses");
        }

        // Validate input data (only validate fields that are provided)
        const updateSchema = z.object({
            title: z.string().min(1, "Title is required").optional(),
            amount: z.union([z.number(), z.string().transform(Number)]).refine(val => val > 0, "Amount must be positive").optional(),
            currency: z.string().optional(),
            notes: z.string().optional(),
            expenseDate: z.string().or(z.date()).transform(val => new Date(val)).optional(),
            tagId: z.string().uuid("Invalid tag ID").optional().nullable(),
        });

        const validatedData = updateSchema.parse(updateData);

        // If tagId is provided, validate it exists
        if (validatedData.tagId) {
            const tag = await prisma.tag.findUnique({
                where: { id: validatedData.tagId },
            });

            if (!tag) {
                return formatResponse(false, "Tag not found");
            }
        }

        // Update expense
        const updatedExpense = await prisma.expense.update({
            where: { id: expenseId },
            data: validatedData,
            include: {
                tag: true,
            },
        });

        return formatResponse(true, "Expense updated successfully", updatedExpense);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return formatResponse(false, "Validation failed", null, {
                errors: error.errors.map((e) => e.message),
            });
        }
        console.error("Error updating expense:", error.message);
        throw error;
    }
};

/**
 * Delete an expense (owner only)
 * @param {string} expenseId - Expense ID
 * @param {string} userId - User ID (for ownership check)
 * @returns {Promise<Object>} - Success response
 */
export const deleteExpense = async (expenseId, userId) => {
    try {
        if (!expenseId) {
            return formatResponse(false, "Expense ID is required");
        }

        // Validate user owns this expense
        const expense = await prisma.expense.findUnique({
            where: { id: expenseId },
        });

        if (!expense) {
            return formatResponse(false, "Expense not found");
        }

        if (expense.userId !== userId) {
            return formatResponse(false, "Access denied: you can only delete your own expenses");
        }

        // Delete expense
        await prisma.expense.delete({
            where: { id: expenseId },
        });

        return formatResponse(true, "Expense deleted successfully", null);
    } catch (error) {
        console.error("Error deleting expense:", error.message);
        throw error;
    }
};
