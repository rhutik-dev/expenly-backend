import { sendResponse } from "../../utils/response.js";
import { getAllTags, createTag, deleteTag } from "./tag.service.js";

/**
 * Controller to get all tags
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllTagsController = async (req, res) => {
  try {
    const result = await getAllTags();

    if (!result.success) {
      return sendResponse(res, 500, false, result.message);
    }

    return sendResponse(res, 200, true, "Tags fetched successfully", result.data);
  } catch (error) {
    console.error("Error in get all tags controller:", error.message);
    return sendResponse(res, 500, false, "Internal server error");
  }
};

/**
 * Controller to create a tag
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createTagController = async (req, res) => {
  try {
    const { name, color } = req.body;

    const result = await createTag({ name, color });

    if (!result.success) {
      return sendResponse(res, 400, false, result.message, null, { errors: result.errors });
    }

    return sendResponse(res, 201, true, "Tag created successfully", result.data);
  } catch (error) {
    console.error("Error in create tag controller:", error.message);
    return sendResponse(res, 500, false, "Internal server error");
  }
};

/**
 * Controller to delete a tag
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteTagController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteTag(id);

    if (!result.success) {
      return sendResponse(res, 404, false, result.message);
    }

    return sendResponse(res, 200, true, "Tag deleted successfully");
  } catch (error) {
    console.error("Error in delete tag controller:", error.message);
    return sendResponse(res, 500, false, "Internal server error");
  }
};
