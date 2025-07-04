const Task = require('../models/task.model');
const mongoose = require('mongoose');

// Get all tasks for a user
exports.getAllTasks = async (req, res) => {
    try {
        const { completed, category, priority, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const userId = req.user.userId;

        // Build filter
        const filter = { userId };

        if (completed !== undefined) {
            filter.completed = completed === 'true';
        }

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (priority && priority !== 'all') {
            filter.priority = priority;
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const tasks = await Task.find(filter)
            .sort(sort)
            .lean(); // For better performance

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error.message
        });
    }
};

// Get recent tasks (for dashboard)
exports.getRecentTasks = async (req, res) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 5;

        const recentTasks = await Task.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            data: recentTasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent tasks',
            error: error.message
        });
    }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        const task = await Task.findOne({ _id: id, userId });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task',
            error: error.message
        });
    }
};

// Create new task
exports.createTask = async (req, res) => {
    try {
        const { title, description, category, priority, deadline } = req.body;
        const userId = req.user.userId;

        // Validation
        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        // Create task
        const task = new Task({
            title: title.trim(),
            description: description?.trim(),
            category,
            priority,
            deadline: deadline ? new Date(deadline) : undefined,
            userId
        });

        await task.save();

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create task',
            error: error.message
        });
    }
};

// Update task
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        // Find and update task
        const task = await Task.findOneAndUpdate(
            { _id: id, userId },
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: task
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update task',
            error: error.message
        });
    }
};

// Toggle task completion
exports.toggleTaskCompletion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        const task = await Task.findOne({ _id: id, userId });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Toggle completion
        task.completed = !task.completed;
        await task.save();

        res.status(200).json({
            success: true,
            message: `Task marked as ${task.completed ? 'completed' : 'incomplete'}`,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to toggle task completion',
            error: error.message
        });
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        const task = await Task.findOneAndDelete({ _id: id, userId });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete task',
            error: error.message
        });
    }
};

// Get task statistics
exports.getTaskStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const stats = await Task.getUserStats(userId);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task statistics',
            error: error.message
        });
    }
};