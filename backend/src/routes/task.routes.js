const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const taskController = require('../controllers/task.controller');

// All task routes require authentication
router.use(authMiddleware);

// GET /api/tasks - Get all tasks for user (with filtering, sorting)
router.get('/', taskController.getAllTasks);

// GET /api/tasks/recent - Get recent tasks for dashboard
router.get('/recent', taskController.getRecentTasks);

// GET /api/tasks/stats - Get task statistics
router.get('/stats', taskController.getTaskStats);

// GET /api/tasks/:id - Get specific task
router.get('/:id', taskController.getTaskById);

// POST /api/tasks - Create new task
router.post('/', taskController.createTask);

// PUT /api/tasks/:id - Update task
router.put('/:id', taskController.updateTask);

// PATCH /api/tasks/:id/toggle - Toggle task completion
router.patch('/:id/toggle', taskController.toggleTaskCompletion);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', taskController.deleteTask);

module.exports = router;