import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { jsonSender } from './utils/response.js';
import logger from './utils/logger.js';
import routes from './routes.js';

const app = express();

// Security middleware
app.use(helmet()); // Add security headers

// CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  credentials: true,
}));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  // Log response when it's sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.request(req.method, req.path, res.statusCode, duration);
  });

  next();
});

// Health check route
app.get('/', (req, res) => {
  return jsonSender(res, 200, {
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
routes(app);

// 404 handler
app.use((_req, res) => {
  return jsonSender(res, 404, {
    message: 'Route not found',
    path: _req.path,
  });
});

// Global error handler
app.use((err, req, res) => {
  logger.error('SERVER', 'Request error', err);

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return jsonSender(res, statusCode, {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
