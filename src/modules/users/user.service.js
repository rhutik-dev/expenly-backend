import prisma from '../../config/db.js'
import bcryptjs from "bcryptjs";
import { z } from "zod";
import { formatResponse } from "../../utils/response.js";



// Validation schema for user registration
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .min(1, "Password is required"),
});

/**
 * Register a new user
 * @param {Object} userData - User data containing name, email, password
 * @returns {Promise<Object>} - Created user object (without password)
 * @throws {Error} - If validation fails or user already exists
 */
export const registerUser = async (userData) => {
  // Validate input data
  const validatedData = registerSchema.parse(userData);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingUser) {
    return formatResponse(false, "User with this email already exists");
  }

  // Hash password
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(validatedData.password, salt);

  // Create user in database
  const user = await prisma.user.create({
    data: {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: "USER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return formatResponse(true, "User registered successfully", user);
};

/**
 * Login a user
 * @param {Object} credentials - User credentials containing email and password
 * @returns {Promise<Object>} - User object with id, name, email, role
 */
export const loginUser = async (credentials) => {
  const { email, password } = credentials;

  // Validate input
  if (!email || !password) {
    return formatResponse(false, "Email and password are required");
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return formatResponse(false, "Invalid email or password");
  }

  // Compare password with hashed password
  const isPasswordValid = await bcryptjs.compare(password, user.password);

  if (!isPasswordValid) {
    return formatResponse(false, "Invalid email or password");
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return formatResponse(true, "User logged in successfully", userWithoutPassword);
};

// Validation schema for profile update
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
});

// Validation schema for password change
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

/**
 * Update user profile (name, email)
 */
export const updateUserProfile = async (userId, data) => {
  const validated = updateProfileSchema.parse(data);

  if (!validated.name && !validated.email) {
    return formatResponse(false, "No fields to update");
  }

  if (validated.email) {
    const existing = await prisma.user.findUnique({ where: { email: validated.email } });
    if (existing && existing.id !== userId) {
      return formatResponse(false, "Email already in use");
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: validated,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return formatResponse(true, "Profile updated successfully", user);
};

/**
 * Change user password
 */
export const changeUserPassword = async (userId, data) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(data);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) {
    return formatResponse(false, "User not found");
  }

  const isValid = await bcryptjs.compare(currentPassword, user.password);
  if (!isValid) {
    return formatResponse(false, "Current password is incorrect");
  }

  const salt = await bcryptjs.genSalt(10);
  const hashed = await bcryptjs.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  return formatResponse(true, "Password changed successfully");
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User object
 */
export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return formatResponse(false, "User not found");
  }

  return formatResponse(true, "User fetched successfully", user);
};
