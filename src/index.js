import 'dotenv/config';
import http from 'http';
import app from './app.js';
import prisma from './config/db.js';
import logger from './utils/logger.js';
import { attachChatWebSocket } from './modules/chatbot/chatbot.websocket.js';

export default app;

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

attachChatWebSocket(server);

server.listen(PORT, () => {
    logger.success('SERVER', `Server is running on port ${PORT}`);
    logger.success('SERVER', `Chat WebSocket listening on /ws/chat`);
});

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

    setTimeout(() => {
        logger.error('SERVER', 'Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
    logger.error('SERVER', 'Uncaught Exception', error);
    gracefulShutdown('uncaughtException');
});
