const Expense = require('../models/expense.model');
const mongoose = require('mongoose');

// Get all expenses for a user
exports.getAllExpenses = async (req, res) => {
    try {
        const {
            category,
            paymentMethod,
            startDate,
            endDate,
            minAmount,
            maxAmount,
            sortBy = 'date',
            sortOrder = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        const userId = req.user.userId;

        // Build filter
        const filter = { userId };

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (paymentMethod && paymentMethod !== 'all') {
            filter.paymentMethod = paymentMethod;
        }

        // Date range filter
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        // Amount range filter
        if (minAmount || maxAmount) {
            filter.amount = {};
            if (minAmount) filter.amount.$gte = parseFloat(minAmount);
            if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [expenses, totalCount] = await Promise.all([
            Expense.find(filter)
                .sort(sort)
                .limit(parseInt(limit))
                .skip(skip)
                .lean(),
            Expense.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            count: expenses.length,
            totalCount,
            data: expenses,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expenses',
            error: error.message
        });
    }
};

// Get recent expenses (for dashboard)
exports.getRecentExpenses = async (req, res) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 5;

        const recentExpenses = await Expense.find({ userId })
            .sort({ date: -1, createdAt: -1 })
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            count: recentExpenses.length,
            data: recentExpenses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent expenses',
            error: error.message
        });
    }
};

// Get expense statistics
exports.getExpenseStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate, endDate } = req.query;

        const stats = await Expense.getUserStats(userId, startDate, endDate);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expense statistics',
            error: error.message
        });
    }
};

// Get monthly chart data
exports.getMonthlyChart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const year = parseInt(req.query.year) || new Date().getFullYear();

        const chartData = await Expense.getMonthlyChart(userId, year);

        res.status(200).json({
            success: true,
            data: chartData,
            meta: {
                year,
                totalMonths: 12
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch monthly chart data',
            error: error.message
        });
    }
};

// Get category analytics
exports.getCategoryAnalytics = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate, endDate } = req.query;

        const analytics = await Expense.getCategoryAnalytics(userId, startDate, endDate);

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category analytics',
            error: error.message
        });
    }
};

// Get specific expense by ID
exports.getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expense ID'
            });
        }

        const expense = await Expense.findOne({ _id: id, userId }).lean();

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            data: expense
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expense',
            error: error.message
        });
    }
};

// Create new expense
exports.createExpense = async (req, res) => {
    try {
        const userId = req.user.userId;
        const expenseData = {
            ...req.body,
            userId
        };

        // Validate required fields
        const { amount, description, category } = expenseData;
        if (!amount || !description || !category) {
            return res.status(400).json({
                success: false,
                message: 'Amount, description, and category are required'
            });
        }

        const expense = new Expense(expenseData);
        await expense.save();

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: expense
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create expense',
            error: error.message
        });
    }
};

// Update expense
exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expense ID'
            });
        }

        // Don't allow userId to be updated
        delete updateData.userId;

        const expense = await Expense.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Expense updated successfully',
            data: expense
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update expense',
            error: error.message
        });
    }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expense ID'
            });
        }

        const expense = await Expense.findOneAndDelete({ _id: id, userId });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully',
            data: expense
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete expense',
            error: error.message
        });
    }
};

// Bulk operations
exports.bulkDeleteExpenses = async (req, res) => {
    try {
        const { expenseIds } = req.body;
        const userId = req.user.userId;

        if (!Array.isArray(expenseIds) || expenseIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'expenseIds array is required'
            });
        }

        // Validate all IDs
        const invalidIds = expenseIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expense IDs provided'
            });
        }

        const result = await Expense.deleteMany({
            _id: { $in: expenseIds },
            userId
        });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} expenses deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete expenses',
            error: error.message
        });
    }
};

// Export expenses to CSV
exports.exportExpenses = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate, endDate, category } = req.query;

        // Build filter
        const filter = { userId };

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const expenses = await Expense.find(filter)
            .sort({ date: -1 })
            .lean();

        // Convert to CSV format
        const csvHeaders = 'Date,Description,Category,Amount,Payment Method,Tags\n';
        const csvData = expenses.map(expense => {
            const date = new Date(expense.date).toLocaleDateString();
            const tags = expense.tags ? expense.tags.join(';') : '';
            return `"${date}","${expense.description}","${expense.category}","${expense.amount}","${expense.paymentMethod}","${tags}"`;
        }).join('\n');

        const csvContent = csvHeaders + csvData;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
        res.status(200).send(csvContent);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to export expenses',
            error: error.message
        });
    }
};