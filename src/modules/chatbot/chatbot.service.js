import Groq from "groq-sdk";
import { formatResponse } from "../../utils/response.js";
import logger from "../../utils/logger.js";
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

    // System prompt with expense context
    const systemPrompt = `You are a personal expense tracker assistant. Help users understand their spending, categorize expenses, and provide financial insights.
You are friendly, helpful, and knowledgeable about personal finance.
When users ask about their expenses, provide specific insights based on their expense data.
Keep responses concise and actionable.

IMPORTANT: Format your responses as follows:
- Use numbered lists for rankings, each item on a new line
- Use bold markdown for category names: **Category Name**
- Add blank lines between sections
- Example format:
  1. **Rent**: ₹5,000 (41% of total)
  2. **Transport**: ₹4,578 (38% of total)
  3. **Food & Dining**: ₹2,500 (21% of total)

${expenseContext}`;

    // Build messages array with conversation history and system prompt
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // Call Groq API
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: messages,
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
    logger.error("CHATBOT", "Error sending chat message", error);
    if (error.message.includes("API")) {
      return formatResponse(false, "AI service error. Please try again later.");
    }
    throw error;
  }
};
