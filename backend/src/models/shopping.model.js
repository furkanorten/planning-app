const mongoose = require('mongoose');

// Shopping List Item Schema
const shoppingItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    quantity: {
        type: Number,
        default: 1,
        min: [0.1, 'Quantity must be greater than 0'],
        max: [999, 'Quantity cannot exceed 999']
    },
    unit: {
        type: String,
        enum: ['piece', 'kg', 'gram', 'liter', 'ml', 'pack', 'box', 'bottle', 'other'],
        default: 'piece'
    },
    estimatedPrice: {
        type: Number,
        min: 0,
        default: 0
    },
    actualPrice: {
        type: Number,
        min: 0
    },
    category: {
        type: String,
        enum: ['grocery', 'dairy', 'meat', 'vegetables', 'fruits', 'beverages', 'snacks', 'household', 'personal_care', 'other'],
        default: 'other'
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 200
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
}, {
    timestamps: true
});

// Main Shopping List Schema
const shoppingListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        default: 'Shopping List'
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    items: [shoppingItemSchema],
    status: {
        type: String,
        enum: ['active', 'completed', 'archived'],
        default: 'active'
    },
    budget: {
        type: Number,
        min: 0
    },
    totalEstimatedCost: {
        type: Number,
        default: 0
    },
    totalActualCost: {
        type: Number,
        default: 0
    },
    color: {
        type: String,
        enum: ['blue', 'green', 'red', 'purple', 'orange', 'pink', 'gray'],
        default: 'blue'
    },
    category: {
        type: String,
        enum: ['weekly', 'monthly', 'special', 'party', 'travel', 'other'],
        default: 'weekly'
    },
    dueDate: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for better performance
shoppingListSchema.index({ userId: 1, status: 1 });
shoppingListSchema.index({ userId: 1, createdAt: -1 });
shoppingListSchema.index({ userId: 1, dueDate: 1 });

// Virtual: completion percentage
shoppingListSchema.virtual('completionPercentage').get(function() {
    if (this.items.length === 0) return 0;
    const completedItems = this.items.filter(item => item.completed).length;
    return Math.round((completedItems / this.items.length) * 100);
});

// Virtual: total items count
shoppingListSchema.virtual('totalItems').get(function() {
    return this.items.length;
});

// Virtual: completed items count
shoppingListSchema.virtual('completedItems').get(function() {
    return this.items.filter(item => item.completed).length;
});

// Virtual: pending items count
shoppingListSchema.virtual('pendingItems').get(function() {
    return this.items.filter(item => !item.completed).length;
});

// Virtual: is overdue
shoppingListSchema.virtual('isOverdue').get(function() {
    if (!this.dueDate || this.status === 'completed') return false;
    return new Date() > this.dueDate;
});

// Virtual: budget status
shoppingListSchema.virtual('budgetStatus').get(function() {
    if (!this.budget) return null;

    const spentAmount = this.totalActualCost || this.totalEstimatedCost;
    const percentage = (spentAmount / this.budget) * 100;

    if (percentage <= 80) return 'within_budget';
    if (percentage <= 100) return 'approaching_limit';
    return 'over_budget';
});

// Pre-save middleware: calculate totals
shoppingListSchema.pre('save', function(next) {
    // Calculate total estimated cost
    this.totalEstimatedCost = this.items.reduce((total, item) => {
        return total + (item.estimatedPrice * item.quantity);
    }, 0);

    // Calculate total actual cost
    this.totalActualCost = this.items.reduce((total, item) => {
        if (item.actualPrice !== undefined) {
            return total + (item.actualPrice * item.quantity);
        }
        return total;
    }, 0);

    // Set completedAt if all items are completed
    const allCompleted = this.items.length > 0 && this.items.every(item => item.completed);
    if (allCompleted && this.status === 'active') {
        this.status = 'completed';
        this.completedAt = new Date();
    } else if (!allCompleted && this.status === 'completed') {
        this.status = 'active';
        this.completedAt = undefined;
    }

    next();
});

// Pre-save middleware for items: set completedAt
shoppingListSchema.pre('save', function(next) {
    this.items.forEach(item => {
        if (item.completed && !item.completedAt) {
            item.completedAt = new Date();
        } else if (!item.completed) {
            item.completedAt = undefined;
        }
    });
    next();
});

// Static method: get user's shopping stats
shoppingListSchema.statics.getUserStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: null,
                totalLists: { $addToSet: '$_id' },
                activeLists: {
                    $addToSet: {
                        $cond: [{ $eq: ['$status', 'active'] }, '$_id', null]
                    }
                },
                completedLists: {
                    $addToSet: {
                        $cond: [{ $eq: ['$status', 'completed'] }, '$_id', null]
                    }
                },
                totalItems: { $sum: 1 },
                completedItems: {
                    $sum: { $cond: [{ $eq: ['$items.completed', true] }, 1, 0] }
                },
                totalSpent: {
                    $sum: {
                        $cond: [
                            { $ne: ['$items.actualPrice', null] },
                            { $multiply: ['$items.actualPrice', '$items.quantity'] },
                            0
                        ]
                    }
                },
                categoryBreakdown: {
                    $push: '$items.category'
                }
            }
        },
        {
            $project: {
                totalLists: { $size: { $filter: { input: '$totalLists', cond: { $ne: ['$$this', null] } } } },
                activeLists: { $size: { $filter: { input: '$activeLists', cond: { $ne: ['$$this', null] } } } },
                completedLists: { $size: { $filter: { input: '$completedLists', cond: { $ne: ['$$this', null] } } } },
                totalItems: 1,
                completedItems: 1,
                totalSpent: { $round: ['$totalSpent', 2] },
                categoryBreakdown: {
                    $reduce: {
                        input: { $filter: { input: '$categoryBreakdown', cond: { $ne: ['$$this', null] } } },
                        initialValue: {},
                        in: {
                            $mergeObjects: [
                                '$$value',
                                {
                                    $arrayToObject: [[{
                                        k: '$$this',
                                        v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] }
                                    }]]
                                }
                            ]
                        }
                    }
                }
            }
        }
    ]);

    const result = stats[0] || {
        totalLists: 0,
        activeLists: 0,
        completedLists: 0,
        totalItems: 0,
        completedItems: 0,
        totalSpent: 0,
        categoryBreakdown: {}
    };

    // Calculate completion rate
    result.completionRate = result.totalItems > 0
        ? Math.round((result.completedItems / result.totalItems) * 100)
        : 0;

    return result;
};

// Static method: get shopping analytics
shoppingListSchema.statics.getShoppingAnalytics = async function(userId, startDate, endDate) {
    const matchStage = {
        userId: new mongoose.Types.ObjectId(userId)
    };

    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const analytics = await this.aggregate([
        { $match: matchStage },
        { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$items.category',
                itemCount: { $sum: 1 },
                totalEstimatedCost: {
                    $sum: { $multiply: ['$items.estimatedPrice', '$items.quantity'] }
                },
                totalActualCost: {
                    $sum: {
                        $cond: [
                            { $ne: ['$items.actualPrice', null] },
                            { $multiply: ['$items.actualPrice', '$items.quantity'] },
                            0
                        ]
                    }
                },
                completedItems: {
                    $sum: { $cond: [{ $eq: ['$items.completed', true] }, 1, 0] }
                }
            }
        },
        {
            $project: {
                category: '$_id',
                itemCount: 1,
                totalEstimatedCost: { $round: ['$totalEstimatedCost', 2] },
                totalActualCost: { $round: ['$totalActualCost', 2] },
                completedItems: 1,
                completionRate: {
                    $round: [
                        { $multiply: [{ $divide: ['$completedItems', '$itemCount'] }, 100] },
                        1
                    ]
                }
            }
        },
        { $match: { category: { $ne: null } } },
        { $sort: { itemCount: -1 } }
    ]);

    return analytics;
};

// Instance method: add item to list
shoppingListSchema.methods.addItem = function(itemData) {
    this.items.push(itemData);
    return this.save();
};

// Instance method: remove item from list
shoppingListSchema.methods.removeItem = function(itemId) {
    this.items.id(itemId).remove();
    return this.save();
};

// Instance method: toggle item completion
shoppingListSchema.methods.toggleItem = function(itemId) {
    const item = this.items.id(itemId);
    if (item) {
        item.completed = !item.completed;
        if (item.completed) {
            item.completedAt = new Date();
        } else {
            item.completedAt = undefined;
        }
    }
    return this.save();
};

// Instance method: update item
shoppingListSchema.methods.updateItem = function(itemId, updateData) {
    const item = this.items.id(itemId);
    if (item) {
        Object.assign(item, updateData);
    }
    return this.save();
};

// Ensure virtual fields are serialized
shoppingListSchema.set('toJSON', { virtuals: true });
shoppingListSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ShoppingList', shoppingListSchema);