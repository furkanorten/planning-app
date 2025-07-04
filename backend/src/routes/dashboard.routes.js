const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

// All dashboard routes require authentication
router.use(authMiddleware);

// GET /api/dashboard/stats - Get comprehensive dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/dashboard/activity - Get recent activity across all modules
router.get('/activity', dashboardController.getRecentActivity);

// GET /api/dashboard/analytics/productivity - Get productivity analytics
router.get('/analytics/productivity', dashboardController.getProductivityAnalytics);

module.exports = router;
