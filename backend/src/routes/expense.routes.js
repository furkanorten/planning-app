const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const expenseController = require('../controllers/expense.controller');

// All expense routes require authentication
router.use(authMiddleware);

// GET /api/expenses - Get all expenses for user (with filtering, sorting, pagination)
router.get('/', expenseController.getAllExpenses);

// GET /api/expenses/recent - Get recent expenses for dashboard
router.get('/recent', expenseController.getRecentExpenses);

// GET /api/expenses/stats - Get expense statistics
router.get('/stats', expenseController.getExpenseStats);

// GET /api/expenses/chart/monthly - Get monthly chart data
router.get('/chart/monthly', expenseController.getMonthlyChart);

// GET /api/expenses/analytics/category - Get category analytics
router.get('/analytics/category', expenseController.getCategoryAnalytics);

// GET /api/expenses/export - Export expenses to CSV
router.get('/export', expenseController.exportExpenses);

// GET /api/expenses/:id - Get specific expense
router.get('/:id', expenseController.getExpenseById);

// POST /api/expenses - Create new expense
router.post('/', expenseController.createExpense);

// PUT /api/expenses/:id - Update expense
router.put('/:id', expenseController.updateExpense);

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', expenseController.deleteExpense);

// POST /api/expenses/bulk/delete - Bulk delete expenses
router.post('/bulk/delete', expenseController.bulkDeleteExpenses);

module.exports = router;