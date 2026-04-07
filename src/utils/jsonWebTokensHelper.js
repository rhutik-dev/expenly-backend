import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

const SECRET_KEY = process.env.JWT_SECRET || 'your_default';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { algorithm: 'HS256', expiresIn: EXPIRES_IN });
};

export const verifyToken = (token) => {
  try {
    return {success: true, data: jwt.verify(token, SECRET_KEY)};
  } catch (error) {
    console.error('JWT verification error:', error);
    return {success: false, error: 'Invalid or expired token'};
  }
};