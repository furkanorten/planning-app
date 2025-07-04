const ShoppingList = require('../models/shopping.model');
const mongoose = require('mongoose');

// Get all shopping lists for a user
exports.getAllShoppingLists = async (req, res) => {
    try {
        const {
            status,
            category,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        const userId = req.user.userId;

        // Build filter
        const filter = { userId };

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (category && category !== 'all') {
            filter.category = category;
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [shoppingLists, totalCount] = await Promise.all([
            ShoppingList.find(filter)
                .sort(sort)
                .limit(parseInt(limit))
                .skip(skip)
                .lean(),
            ShoppingList.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            count: shoppingLists.length,
            totalCount,
            data: shoppingLists,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shopping lists',
            error: error.message
        });
    }
};

// Get recent shopping lists (for dashboard)
exports.getRecentShoppingLists = async (req, res) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 3;

        const recentLists = await ShoppingList.find({
            userId,
            status: { $in: ['active', 'completed'] }
        })
            .sort({ updatedAt: -1 })
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            count: recentLists.length,
            data: recentLists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent shopping lists',
            error: error.message
        });
    }
};

// Get shopping statistics
exports.getShoppingStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const stats = await ShoppingList.getUserStats(userId);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shopping statistics',
            error: error.message
        });
    }
};

// Get shopping analytics
exports.getShoppingAnalytics = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate, endDate } = req.query;

        const analytics = await ShoppingList.getShoppingAnalytics(userId, startDate, endDate);

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shopping analytics',
            error: error.message
        });
    }
};

// Get specific shopping list by ID
exports.getShoppingListById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shopping list ID'
            });
        }

        const shoppingList = await ShoppingList.findOne({ _id: id, userId });

        if (!shoppingList) {
            return res.status(404).json({
                success: false,
                message: 'Shopping list not found'
            });
        }

        res.status(200).json({
            success: true,
            data: shoppingList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shopping list',
            error: error.message
        });
    }
};

// Create new shopping list
exports.createShoppingList = async (req, res) => {
    try {
        const userId = req.user.userId;
        const shoppingListData = {
            ...req.body,
            userId
        };

        // Validate required fields
        const { name } = shoppingListData;
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Shopping list name is required'
            });
        }

        const shoppingList = new ShoppingList(shoppingListData);
        await shoppingList.save();

        res.status(201).json({
            success: true,
            message: 'Shopping list created successfully',
            data: shoppingList
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
            message: 'Failed to create shopping list',
            error: error.message
        });
    }
};

// Update shopping list
exports.updateShoppingList = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shopping list ID'
            });
        }

        // Don't allow userId to be updated
        delete updateData.userId;

        const shoppingList = await ShoppingList.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!shoppingList) {
            return res.status(404).json({
                success: false,
                message: 'Shopping list not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Shopping list updated successfully',
            data: shoppingList
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
            message: 'Failed to update shopping list',
            error: error.message
        });
    }
};

// Delete shopping list
exports.deleteShoppingList = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shopping list ID'
            });
        }

        const shoppingList = await ShoppingList.findOneAndDelete({ _id: id, userId });

        if (!shoppingList) {
            return res.status(404).json({
                success: false,
                message: 'Shopping list not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Shopping list deleted successfully',
            data: shoppingList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete shopping list',
            error: error.message
        });
    }
};

// ITEM MANAGEMENT ENDPOINTS

// Add item to shopping list
exports.addItemToList = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const itemData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shopping list ID'
            });
        }

        // Validate required fields
        const { name } = itemData;
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Item name is required'
            });
        }

        const shoppingList = await ShoppingList.findOne({ _id: id, userId });

        if (!shoppingList) {
            return res.status(404).json({
                success: false,
                message: 'Shopping list not found'
            });
        }

        await shoppingList.addItem(itemData);

        res.status(201).json({
            success: true,
            message: 'Item added to shopping list successfully',
            data: shoppingList
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
            message: 'Failed to add item to shopping list',
            error: error.message
        });
    }
};

// Update item in shopping list
exports.updateItemInList = async (req, res) => {
    try {
        const { id, itemId } = req.params;
        const userId = req.user.userId;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shopping list or item ID'
            });
        }

        const shoppingList = await ShoppingList.findOne({ _id: id, userId });

        if (!shoppingList) {
            return res.status(404).json({
                success: false,
                message: 'Shopping list not found'
            });
        }

        const item = shoppingList.items.id(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in shopping list'
            });
        }

        await shoppingList.updateItem(itemId, updateData);

        res.status(200).json({
            success: true,
            message: 'Item updated successfully',
            data: shoppingList
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
            message: 'Failed to update item',
            error: error.message
        });
    }
};

// Toggle item completion
exports.toggleItemCompletion = async (req, res) => {
    try {
        const { id, itemId } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shopping list or item ID'
            });
        }

        const shoppingList = await ShoppingList.findOne({ _id: id, userId });

        if (!shoppingList) {
            return res.status(404).json({
                success: false,
                message: 'Shopping list not found'
            });
        }

        const item = shoppingList.items.id(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in shopping list'
            });
        }

        await shoppingList.toggleItem(itemId);

        res.status(200).json({
            success: true,
            message: `Item ${item.completed ? 'unmarked' : 'marked'} as ${item.completed ? 'pending' : 'completed'}`,
            data: shoppingList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to toggle item completion',
            error: error.message
        });
    }
};

// Remove item from shopping list
exports.removeItemFromList = async (req, res) => {
    try {
        const { id, itemId } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shopping list or item ID'
            });
        }

        const shoppingList = await ShoppingList.findOne({ _id: id, userId });

        if (!shoppingList) {
            return res.status(404).json({
                success: false,
                message: 'Shopping list not found'
            });
        }

        const item = shoppingList.items.id(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in shopping list'
            });
        }

        await shoppingList.removeItem(itemId);

        res.status(200).json({
            success: true,
            message: 'Item removed from shopping list successfully',
            data: shoppingList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from shopping list',
            error: error.message
        });
    }
};

// Bulk operations for items
exports.bulkUpdateItems = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, itemIds, updateData } = req.body;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shopping list ID'
            });
        }

        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'itemIds array is required'
            });
        }

        const shoppingList = await ShoppingList.findOne({ _id: id, userId });

        if (!shoppingList) {
            return res.status(404).json({
                success: false,
                message: 'Shopping list not found'
            });
        }

        let updatedCount = 0;

        switch (action) {
            case 'complete':
                itemIds.forEach(itemId => {
                    const item = shoppingList.items.id(itemId);
                    if (item && !item.completed) {
                        item.completed = true;
                        item.completedAt = new Date();
                        updatedCount++;
                    }
                });
                break;

            case 'uncomplete':
                itemIds.forEach(itemId => {
                    const item = shoppingList.items.id(itemId);
                    if (item && item.completed) {
                        item.completed = false;
                        item.completedAt = undefined;
                        updatedCount++;
                    }
                });
                break;

            case 'delete':
                itemIds.forEach(itemId => {
                    const item = shoppingList.items.id(itemId);
                    if (item) {
                        item.remove();
                        updatedCount++;
                    }
                });
                break;

            case 'update':
                if (!updateData) {
                    return res.status(400).json({
                        success: false,
                        message: 'updateData is required for update action'
                    });
                }
                itemIds.forEach(itemId => {
                    const item = shoppingList.items.id(itemId);
                    if (item) {
                        Object.assign(item, updateData);
                        updatedCount++;
                    }
                });
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action. Allowed actions: complete, uncomplete, delete, update'
                });
        }

        await shoppingList.save();

        res.status(200).json({
            success: true,
            message: `${updatedCount} items ${action}d successfully`,
            updatedCount,
            data: shoppingList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to perform bulk operation',
            error: error.message
        });
    }
};

// Archive completed shopping list
exports.archiveShoppingList = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shopping list ID'
            });
        }

        const shoppingList = await ShoppingList.findOneAndUpdate(
            { _id: id, userId },
            { status: 'archived' },
            { new: true }
        );

        if (!shoppingList) {
            return res.status(404).json({
                success: false,
                message: 'Shopping list not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Shopping list archived successfully',
            data: shoppingList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to archive shopping list',
            error: error.message
        });
    }
};

// Duplicate shopping list
exports.duplicateShoppingList = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shopping list ID'
            });
        }

        const originalList = await ShoppingList.findOne({ _id: id, userId });

        if (!originalList) {
            return res.status(404).json({
                success: false,
                message: 'Shopping list not found'
            });
        }

        // Create a copy with reset completion status
        const duplicatedData = {
            name: `${originalList.name} (Copy)`,
            description: originalList.description,
            items: originalList.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                estimatedPrice: item.estimatedPrice,
                category: item.category,
                notes: item.notes,
                priority: item.priority,
                completed: false // Reset completion status
            })),
            budget: originalList.budget,
            color: originalList.color,
            category: originalList.category,
            userId
        };

        const duplicatedList = new ShoppingList(duplicatedData);
        await duplicatedList.save();

        res.status(201).json({
            success: true,
            message: 'Shopping list duplicated successfully',
            data: duplicatedList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to duplicate shopping list',
            error: error.message
        });
    }
};

// Export shopping list to text
exports.exportShoppingList = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { format = 'text' } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shopping list ID'
            });
        }

        const shoppingList = await ShoppingList.findOne({ _id: id, userId });

        if (!shoppingList) {
            return res.status(404).json({
                success: false,
                message: 'Shopping list not found'
            });
        }

        if (format === 'csv') {
            // CSV format
            const csvHeaders = 'Item,Quantity,Unit,Category,Estimated Price,Actual Price,Completed,Notes\n';
            const csvData = shoppingList.items.map(item => {
                return `"${item.name}","${item.quantity}","${item.unit}","${item.category}","${item.estimatedPrice || 0}","${item.actualPrice || ''}","${item.completed ? 'Yes' : 'No'}","${item.notes || ''}"`;
            }).join('\n');

            const csvContent = csvHeaders + csvData;

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${shoppingList.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv"`);
            res.status(200).send(csvContent);
        } else {
            // Plain text format
            let textContent = `Shopping List: ${shoppingList.name}\n`;
            if (shoppingList.description) {
                textContent += `Description: ${shoppingList.description}\n`;
            }
            textContent += `Created: ${shoppingList.createdAt.toLocaleDateString()}\n`;
            textContent += `Items: ${shoppingList.items.length}\n`;
            textContent += `Completed: ${shoppingList.completedItems}/${shoppingList.totalItems}\n\n`;

            textContent += 'ITEMS:\n';
            textContent += '------\n';

            shoppingList.items.forEach((item, index) => {
                const status = item.completed ? '✓' : '○';
                textContent += `${status} ${item.name}`;
                if (item.quantity !== 1) {
                    textContent += ` (${item.quantity} ${item.unit})`;
                }
                if (item.estimatedPrice > 0) {
                    textContent += ` - ${item.estimatedPrice}`;
                }
                if (item.notes) {
                    textContent += ` - ${item.notes}`;
                }
                textContent += '\n';
            });

            if (shoppingList.budget) {
                textContent += `\nBudget: ${shoppingList.budget}`;
                textContent += `\nEstimated Total: ${shoppingList.totalEstimatedCost}`;
                if (shoppingList.totalActualCost > 0) {
                    textContent += `\nActual Total: ${shoppingList.totalActualCost}`;
                }
            }

            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="${shoppingList.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt"`);
            res.status(200).send(textContent);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to export shopping list',
            error: error.message
        });
    }
};