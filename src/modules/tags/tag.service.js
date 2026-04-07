import prisma from "../../config/db.js";
import { z } from "zod";
import { formatResponse } from "../../utils/response.js";

/**
 * Validation schema for tag creation
 */
const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional().default("#B2BEB5"),
});

/**
 * Get all tags
 * @returns {Promise<Object>} - Array of tags
 */
export const getAllTags = async () => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { createdAt: "asc" },
    });

    return formatResponse(true, "Tags fetched successfully", tags);
  } catch (error) {
    console.error("Error fetching tags:", error.message);
    throw error;
  }
};

/**
 * Create a new tag
 * @param {Object} tagData - Tag data
 * @returns {Promise<Object>} - Created tag
 */
export const createTag = async (tagData) => {
  try {
    // Validate input data
    const validatedData = createTagSchema.parse(tagData);

    // Check if tag with same name already exists
    const existingTag = await prisma.tag.findFirst({
      where: { name: validatedData.name },
    });

    if (existingTag) {
      return formatResponse(false, "Tag with this name already exists");
    }

    // Create tag in database
    const tag = await prisma.tag.create({
      data: {
        name: validatedData.name,
        color: validatedData.color,
      },
    });

    return formatResponse(true, "Tag created successfully", tag);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return formatResponse(false, "Validation failed", null, {
        errors: error.errors.map((e) => e.message),
      });
    }
    console.error("Error creating tag:", error.message);
    throw error;
  }
};

/**
 * Delete a tag
 * @param {string} tagId - Tag ID
 * @returns {Promise<Object>} - Success response
 */
export const deleteTag = async (tagId) => {
  try {
    if (!tagId) {
      return formatResponse(false, "Tag ID is required");
    }

    // Check if tag exists
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      return formatResponse(false, "Tag not found");
    }

    // Delete tag
    await prisma.tag.delete({
      where: { id: tagId },
    });

    return formatResponse(true, "Tag deleted successfully", null);
  } catch (error) {
    console.error("Error deleting tag:", error.message);
    throw error;
  }
};
