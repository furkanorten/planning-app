const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const shoppingController = require('../controllers/shopping.controller');

// All shopping routes require authentication
router.use(authMiddleware);

// SHOPPING LIST ROUTES

// GET /api/shopping - Get all shopping lists for user (with filtering, sorting, pagination)
router.get('/', shoppingController.getAllShoppingLists);

// GET /api/shopping/recent - Get recent shopping lists for dashboard
router.get('/recent', shoppingController.getRecentShoppingLists);

// GET /api/shopping/stats - Get shopping statistics
router.get('/stats', shoppingController.getShoppingStats);

// GET /api/shopping/analytics - Get shopping analytics
router.get('/analytics', shoppingController.getShoppingAnalytics);

// GET /api/shopping/:id - Get specific shopping list
router.get('/:id', shoppingController.getShoppingListById);

// POST /api/shopping - Create new shopping list
router.post('/', shoppingController.createShoppingList);

// PUT /api/shopping/:id - Update shopping list
router.put('/:id', shoppingController.updateShoppingList);

// DELETE /api/shopping/:id - Delete shopping list
router.delete('/:id', shoppingController.deleteShoppingList);

// SHOPPING LIST ACTIONS

// PATCH /api/shopping/:id/archive - Archive shopping list
router.patch('/:id/archive', shoppingController.archiveShoppingList);

// POST /api/shopping/:id/duplicate - Duplicate shopping list
router.post('/:id/duplicate', shoppingController.duplicateShoppingList);

// GET /api/shopping/:id/export - Export shopping list (text/csv)
router.get('/:id/export', shoppingController.exportShoppingList);

// ITEM MANAGEMENT ROUTES

// POST /api/shopping/:id/items - Add item to shopping list
router.post('/:id/items', shoppingController.addItemToList);

// PUT /api/shopping/:id/items/:itemId - Update item in shopping list
router.put('/:id/items/:itemId', shoppingController.updateItemInList);

// PATCH /api/shopping/:id/items/:itemId/toggle - Toggle item completion
router.patch('/:id/items/:itemId/toggle', shoppingController.toggleItemCompletion);

// DELETE /api/shopping/:id/items/:itemId - Remove item from shopping list
router.delete('/:id/items/:itemId', shoppingController.removeItemFromList);

// BULK OPERATIONS

// POST /api/shopping/:id/items/bulk - Bulk operations on items (complete, uncomplete, delete, update)
router.post('/:id/items/bulk', shoppingController.bulkUpdateItems);

module.exports = router;