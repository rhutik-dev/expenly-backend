import Groq from "groq-sdk";
import { formatResponse } from "../../utils/response.js";
import prisma from "../../config/db.js";

/**
 * Initialize Groq client
 * @returns {Groq} - Groq client instance
 */
const initializeGroq = () => {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
};

/**
 * Send a chat message to Groq and get a response
 * @param {Object} params - Parameters
 * @param {string} params.message - User message
 * @param {string} params.userId - User ID for context
 * @param {Array} params.conversationHistory - Previous messages for context
 * @returns {Promise<Object>} - AI response
 */
export const sendChatMessage = async ({ message, userId, conversationHistory = [] }) => {
  try {
    if (!message || message.trim().length === 0) {
      return formatResponse(false, "Message cannot be empty");
    }

    if (!userId) {
      return formatResponse(false, "User ID is required");
    }

    // Get user's expenses for context
    const userExpenses = await prisma.expense.findMany({
      where: { userId },
      include: { tag: true },
      orderBy: { expenseDate: "desc" },
      take: 10, // Get last 10 expenses for context
    });

    // Build context about user's expenses
    let expenseContext = "";
    if (userExpenses.length > 0) {
      const totalExpenses = userExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      const expensesByTag = {};
      userExpenses.forEach((exp) => {
        const tagName = exp.tag?.name || "Uncategorized";
        if (!expensesByTag[tagName]) {
          expensesByTag[tagName] = 0;
        }
        expensesByTag[tagName] += parseFloat(exp.amount);
      });

      expenseContext = `\n\nUser's Recent Expenses Context:\n`;
      expenseContext += `Total recent expenses: ${totalExpenses.toFixed(2)} (${userExpenses[0]?.currency || "INR"})\n`;
      expenseContext += `Expenses by category:\n`;
      Object.entries(expensesByTag).forEach(([tag, amount]) => {
        expenseContext += `- ${tag}: ${amount.toFixed(2)}\n`;
      });
    }

    // Initialize Groq
    const groq = initializeGroq();

    // Build messages array with conversation history
    const messages = [
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // System prompt with expense context
    const systemPrompt = `You are a personal expense tracker assistant. Help users understand their spending, categorize expenses, and provide financial insights.
You are friendly, helpful, and knowledgeable about personal finance.
When users ask about their expenses, provide specific insights based on their expense data.
Keep responses concise and actionable.${expenseContext}`;

    // Call Groq API
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: messages,
      system: systemPrompt,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiResponse = response.choices[0]?.message?.content;

    if (!aiResponse) {
      return formatResponse(false, "Failed to get response from AI");
    }

    return formatResponse(true, "Chat message processed successfully", {
      message: aiResponse,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error sending chat message:", error.message);
    if (error.message.includes("API")) {
      return formatResponse(false, "AI service error. Please try again later.");
    }
    throw error;
  }
};
