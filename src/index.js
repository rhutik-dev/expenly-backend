import 'dotenv/config';
import app from './app.js';
import prisma from './config/db.js';
import logger from './utils/logger.js';

// Export app for Vercel serverless
export default app;

// Only start server in local development (not in Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, () => {
        logger.success('SERVER', `Server is running on http://localhost:${PORT}`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal) => {
        logger.warn('SERVER', `${signal} received. Starting graceful shutdown...`);

        server.close(async () => {
            logger.info('SERVER', 'HTTP server closed');

            try {
                await prisma.$disconnect();
                logger.success('DATABASE', 'Database connection closed');
            } catch (error) {
                logger.error('DATABASE', 'Error closing database connection', error);
            }

            process.exit(0);
        });

        // Force shutdown after 30 seconds
        setTimeout(() => {
            logger.error('SERVER', 'Forced shutdown after timeout');
            process.exit(1);
        }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        logger.error('SERVER', 'Uncaught Exception', error);
        gracefulShutdown('uncaughtException');
    });
}