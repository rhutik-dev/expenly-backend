import userRouter from './modules/users/user.routes.js';
import expenseRouter from './modules/expenses/expenses.routes.js';
import tagRouter from './modules/tags/tag.routes.js';
import chatbotRouter from './modules/chatbot/chatbot.routes.js';

const routes = (app) => {
    // User routes
    app.use('/api/users', userRouter);

    // Expense routes
    app.use('/api/expenses', expenseRouter);

    // Tag routes
    app.use('/api/tags', tagRouter);

    // Chatbot routes
    app.use('/api/chatbot', chatbotRouter);
};

export default routes;
