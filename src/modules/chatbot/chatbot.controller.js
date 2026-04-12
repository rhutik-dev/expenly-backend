import { sendResponse } from "../../utils/response.js";
import logger from "../../utils/logger.js";
import { sendChatMessage } from "./chatbot.service.js";

/**
 * Controller for sending a chat message to the AI chatbot
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const chatController = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const userId = req.user.id;

    if (!message) {
      return sendResponse(res, 400, false, "Message is required");
    }

    // Validate conversation history if provided
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return sendResponse(res, 400, false, "Conversation history must be an array");
    }

    const result = await sendChatMessage({
      message,
      userId,
      conversationHistory: conversationHistory || [],
    });

    if (!result.success) {
      return sendResponse(res, 500, false, result.message);
    }

    return sendResponse(res, 200, true, "Message processed successfully", result.data);
  } catch (error) {
    logger.error("CHATBOT_CONTROLLER", "Error in chat controller", error);
    return sendResponse(res, 500, false, "Internal server error");
  }
};

/**
 * Controller for chatbot health check
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const healthController = (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "chatbot",
    timestamp: new Date().toISOString(),
  });
};
