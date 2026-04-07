import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import { jsonSender } from './utils/response.js';
import routes from './routes.js';

const app = express();

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Security middleware
app.use(helmet()); // Add security headers

// CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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
app.use((req, _, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
    timestamp: new Date().toISOString(),
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
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

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
