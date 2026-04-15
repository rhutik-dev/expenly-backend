import { generateToken } from "../../utils/jsonWebTokensHelper.js";
import { sendCookie } from "../../utils/cookie.js";
import { sendResponse } from "../../utils/response.js";
import {
  registerUser,
  loginUser,
  getUserById as getUserByIdService,
  updateUserProfile,
  changeUserPassword,
} from "./user.service.js";

/**
 * Controller for user registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const signupUserController = async (req, res) => {
  try {
    const { name, email, password } = req?.body || {};

    // check if all fields are present
    if (!name || !email || !password) {
      return sendResponse(res, 400, false, "All fields are required");
    }

    // send for registration + available in db
    const result = await registerUser({ name, email, password });

    if (!result.success) {
      return sendResponse(res, 409, false, result.message);
    }

    // generate jwt token with user data
    const token = generateToken({ id: result.data.id, email: result.data.email, role: result.data.role });

    // set cookie using util
    sendCookie(res, "auth", token);

    return sendResponse(res, 201, true, "User registered successfully", result.data, { token });
  } catch (error) {
    console.error("Error in user registration:", error.message);
    return sendResponse(res, 500, false, "Internal server error");
  }
};

/**
 * Controller for user login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const signinUserController = async (req, res) => {
  try {
    const { email, password } = req?.body || {};

    // Check if all fields are present
    if (!email || !password) {
      return sendResponse(res, 400, false, "Email and password are required");
    }

    // Attempt login
    const result = await loginUser({ email, password });

    if (!result.success) {
      return sendResponse(res, 401, false, result.message);
    }

    // Generate JWT token with user data
    const token = generateToken({ id: result.data.id, email: result.data.email, role: result.data.role });

    // Set cookie
    sendCookie(res, "auth", token);

    return sendResponse(res, 200, true, "User logged in successfully", result.data, { token });
  } catch (error) {
    console.error("Error in user signin:", error.message);
    return sendResponse(res, 500, false, "Internal server error");
  }
};

/**
 * Controller to get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getUserByIdService(id);

    return sendResponse(res, 200, true, "User fetched successfully", user);
  } catch (error) {
    console.error("Error fetching user:", error.message);

    if (error.message.includes("not found")) {
      return sendResponse(res, 404, false, error.message);
    }

    return sendResponse(res, 500, false, "Internal server error");
  }
};

/**
 * Controller to update user profile
 */
export const updateUserProfileController = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user?.id !== id) {
      return sendResponse(res, 403, false, "You can only update your own profile");
    }

    const result = await updateUserProfile(id, req.body || {});

    if (!result.success) {
      return sendResponse(res, 400, false, result.message);
    }

    return sendResponse(res, 200, true, result.message, result.data);
  } catch (error) {
    if (error.name === "ZodError") {
      return sendResponse(res, 400, false, error.issues?.[0]?.message || "Validation failed");
    }
    console.error("Error updating profile:", error.message);
    return sendResponse(res, 500, false, "Internal server error");
  }
};

/**
 * Controller to change user password
 */
export const changePasswordController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(res, 401, false, "Unauthorized");
    }

    const result = await changeUserPassword(userId, req.body || {});

    if (!result.success) {
      return sendResponse(res, 400, false, result.message);
    }

    return sendResponse(res, 200, true, result.message);
  } catch (error) {
    if (error.name === "ZodError") {
      return sendResponse(res, 400, false, error.issues?.[0]?.message || "Validation failed");
    }
    console.error("Error changing password:", error.message);
    return sendResponse(res, 500, false, "Internal server error");
  }
};