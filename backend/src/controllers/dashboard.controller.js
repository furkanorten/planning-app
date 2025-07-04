const Task = require('../models/task.model');
const Note = require('../models/note.model');
const Expense = require('../models/expense.model');
const ShoppingList = require('../models/shopping.model');
const mongoose = require('mongoose');

// Get comprehensive dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { timeRange = '30' } = req.query; // days

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        // Get stats from all modules in parallel
        const [
            taskStats,
            noteStats,
            expenseStats,
            shoppingStats,
            recentActivity
        ] = await Promise.all([
            Task.getUserStats(userId),
            Note.getUserStats(userId),
            Expense.getUserStats(userId, startDate, endDate),
            ShoppingList.getUserStats(userId),
            getRecentActivity(userId, 10) // Last 10 activities
        ]);

        // Calculate additional metrics
        const dashboardData = {
            overview: {
                totalTasks: taskStats.totalTasks || 0,
                completedTasks: taskStats.completedTasks || 0,
                totalNotes: noteStats.totalNotes || 0,
                monthlyExpenses: expenseStats.totalAmount || 0,
                activeShoppingLists: shoppingStats.activeLists || 0,
                completionRate: taskStats.totalTasks > 0
                    ? Math.round((taskStats.completedTasks / taskStats.totalTasks) * 100)
                    : 0
            },
            tasks: {
                ...taskStats,
                productivity: calculateProductivityScore(taskStats)
            },
            notes: {
                ...noteStats,
                averageWordsPerNote: noteStats.totalNotes > 0
                    ? Math.round(noteStats.totalWords / noteStats.totalNotes) || 0
                    : 0
            },
            expenses: {
                ...expenseStats,
                averageDaily: timeRange > 0
                    ? Math.round((expenseStats.totalAmount / parseInt(timeRange)) * 100) / 100
                    : 0,
                budgetAlert: expenseStats.totalAmount > 1000 // Simple budget alert
            },
            shopping: {
                ...shoppingStats,
                efficiency: shoppingStats.totalItems > 0
                    ? Math.round((shoppingStats.completedItems / shoppingStats.totalItems) * 100)
                    : 0
            },
            recentActivity,
            trends: await calculateTrends(userId, timeRange),
            achievements: await calculateAchievements(userId, taskStats, noteStats, expenseStats, shoppingStats)
        };

        res.status(200).json({
            success: true,
            data: dashboardData,
            meta: {
                timeRange: parseInt(timeRange),
                generatedAt: new Date(),
                userId
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};

// Get recent activity across all modules
exports.getRecentActivity = async (req, res) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 20;

        const recentActivity = await getRecentActivity(userId, limit);

        res.status(200).json({
            success: true,
            count: recentActivity.length,
            data: recentActivity
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent activity',
            error: error.message
        });
    }
};

// Get productivity analytics
exports.getProductivityAnalytics = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { period = 'week' } = req.query; // week, month, year

        let startDate, endDate = new Date();

        switch (period) {
            case 'week':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
        }

        const analytics = await getProductivityAnalytics(userId, startDate, endDate, period);

        res.status(200).json({
            success: true,
            data: analytics,
            meta: {
                period,
                startDate,
                endDate
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch productivity analytics',
            error: error.message
        });
    }
};

// Helper function: Get recent activity from all modules
async function getRecentActivity(userId, limit) {
    const activities = [];

    // Recent tasks
    const recentTasks = await Task.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(Math.ceil(limit / 4))
        .select('title completed updatedAt')
        .lean();

    recentTasks.forEach(task => {
        activities.push({
            type: 'task',
            action: task.completed ? 'completed' : 'updated',
            title: task.title,
            timestamp: task.updatedAt,
            icon: 'check-square'
        });
    });

    // Recent notes
    const recentNotes = await Note.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(Math.ceil(limit / 4))
        .select('title updatedAt')
        .lean();

    recentNotes.forEach(note => {
        activities.push({
            type: 'note',
            action: 'updated',
            title: note.title,
            timestamp: note.updatedAt,
            icon: 'edit'
        });
    });

    // Recent expenses
    const recentExpenses = await Expense.find({ userId })
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limit / 4))
        .select('description amount category createdAt')
        .lean();

    recentExpenses.forEach(expense => {
        activities.push({
            type: 'expense',
            action: 'added',
            title: `${expense.description} - $${expense.amount}`,
            category: expense.category,
            timestamp: expense.createdAt,
            icon: 'dollar-sign'
        });
    });

    // Recent shopping activity
    const recentShopping = await ShoppingList.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(Math.ceil(limit / 4))
        .select('name items updatedAt')
        .lean();

    recentShopping.forEach(list => {
        const completedItems = list.items.filter(item => item.completed).length;
        activities.push({
            type: 'shopping',
            action: 'updated',
            title: `${list.name} (${completedItems}/${list.items.length} items)`,
            timestamp: list.updatedAt,
            icon: 'shopping-cart'
        });
    });

    // Sort by timestamp and return limited results
    return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
}

// Helper function: Calculate productivity score
function calculateProductivityScore(taskStats) {
    const { totalTasks, completedTasks, overdueTasks } = taskStats;

    if (totalTasks === 0) return 0;

    let score = (completedTasks / totalTasks) * 100;

    // Penalty for overdue tasks
    if (overdueTasks > 0) {
        const overduePenalty = (overdueTasks / totalTasks) * 20;
        score = Math.max(0, score - overduePenalty);
    }

    return Math.round(score);
}

// Helper function: Calculate trends
async function calculateTrends(userId, timeRange) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - parseInt(timeRange));

    // Current period stats
    const [currentExpenses, currentTasks] = await Promise.all([
        Expense.getUserStats(userId, startDate, endDate),
        Task.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate, $lte: endDate }
        })
    ]);

    // Previous period stats
    const [previousExpenses, previousTasks] = await Promise.all([
        Expense.getUserStats(userId, previousStartDate, startDate),
        Task.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: previousStartDate, $lt: startDate }
        })
    ]);

    return {
        expenses: {
            current: currentExpenses.totalAmount || 0,
            previous: previousExpenses.totalAmount || 0,
            trend: calculateTrendPercentage(previousExpenses.totalAmount, currentExpenses.totalAmount)
        },
        tasks: {
            current: currentTasks || 0,
            previous: previousTasks || 0,
            trend: calculateTrendPercentage(previousTasks, currentTasks)
        }
    };
}

// Helper function: Calculate trend percentage
function calculateTrendPercentage(previous, current) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

// Helper function: Calculate achievements
async function calculateAchievements(userId, taskStats, noteStats, expenseStats, shoppingStats) {
    const achievements = [];

    // Task achievements
    if (taskStats.completedTasks >= 10) {
        achievements.push({
            type: 'task',
            title: 'Task Master',
            description: `Completed ${taskStats.completedTasks} tasks`,
            icon: 'trophy',
            color: 'gold'
        });
    }

    // Note achievements
    if (noteStats.totalNotes >= 5) {
        achievements.push({
            type: 'note',
            title: 'Note Taker',
            description: `Created ${noteStats.totalNotes} notes`,
            icon: 'edit',
            color: 'blue'
        });
    }

    // Shopping achievements
    if (shoppingStats.completionRate >= 80) {
        achievements.push({
            type: 'shopping',
            title: 'Shopping Pro',
            description: `${shoppingStats.completionRate}% completion rate`,
            icon: 'shopping-cart',
            color: 'green'
        });
    }

    // Expense tracking achievement
    if (expenseStats.totalExpenses >= 20) {
        achievements.push({
            type: 'expense',
            title: 'Budget Tracker',
            description: `Tracked ${expenseStats.totalExpenses} expenses`,
            icon: 'dollar-sign',
            color: 'purple'
        });
    }

    return achievements.slice(0, 3); // Return top 3 achievements
}

// Helper function: Get productivity analytics
async function getProductivityAnalytics(userId, startDate, endDate, period) {
    // This would include detailed analytics based on the period
    // For now, returning basic structure
    return {
        tasksCompleted: await Task.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            completed: true,
            completedAt: { $gte: startDate, $lte: endDate }
        }),
        notesCreated: await Note.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate, $lte: endDate }
        }),
        expensesTracked: await Expense.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate }
        }),
        period
    };
}