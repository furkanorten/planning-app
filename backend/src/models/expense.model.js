const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        min: [0.01, 'Amount must be greater than 0'],
        max: [999999.99, 'Amount cannot exceed 999,999.99']
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    category: {
        type: String,
        required: true,
        enum: ['food', 'transport', 'shopping', 'bills', 'entertainment', 'health', 'education', 'other'],
        default: 'other'
    },
    subcategory: {
        type: String,
        trim: true,
        maxlength: 100
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        validate: {
            validator: function(date) {
                // Future tarih olamaz (max 1 gün ileri)
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return date <= tomorrow;
            },
            message: 'Expense date cannot be more than 1 day in the future'
        }
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'bank_transfer', 'digital_wallet', 'other'],
        default: 'cash'
    },
    recurring: {
        type: Boolean,
        default: false
    },
    recurringPeriod: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: function() {
            return this.recurring === true;
        }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 50
    }],
    receipt: {
        hasReceipt: {
            type: Boolean,
            default: false
        },
        receiptUrl: {
            type: String,
            trim: true
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, createdAt: -1 });

// Virtual property: formatted amount with currency
expenseSchema.virtual('formattedAmount').get(function() {
    return `$${this.amount.toFixed(2)}`;
});

// Virtual property: month/year for grouping
expenseSchema.virtual('monthYear').get(function() {
    const date = new Date(this.date);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
});

// Static method: get user's expense stats
expenseSchema.statics.getUserStats = async function(userId, startDate, endDate) {
    const matchStage = {
        userId: new mongoose.Types.ObjectId(userId)
    };

    // Date range filter
    if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = new Date(startDate);
        if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const stats = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalExpenses: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                averageAmount: { $avg: '$amount' },
                categoryBreakdown: {
                    $push: {
                        category: '$category',
                        amount: '$amount'
                    }
                },
                paymentMethodBreakdown: {
                    $push: '$paymentMethod'
                }
            }
        },
        {
            $project: {
                totalExpenses: 1,
                totalAmount: { $round: ['$totalAmount', 2] },
                averageAmount: { $round: ['$averageAmount', 2] },
                categoryBreakdown: {
                    $reduce: {
                        input: '$categoryBreakdown',
                        initialValue: {},
                        in: {
                            $mergeObjects: [
                                '$$value',
                                {
                                    $arrayToObject: [[{
                                        k: '$$this.category',
                                        v: {
                                            $add: [
                                                { $ifNull: [{ $getField: { field: '$$this.category', input: '$$value' } }, 0] },
                                                '$$this.amount'
                                            ]
                                        }
                                    }]]
                                }
                            ]
                        }
                    }
                },
                paymentMethodBreakdown: {
                    $reduce: {
                        input: '$paymentMethodBreakdown',
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

    return stats[0] || {
        totalExpenses: 0,
        totalAmount: 0,
        averageAmount: 0,
        categoryBreakdown: {},
        paymentMethodBreakdown: {}
    };
};

// Static method: get monthly expense chart data
expenseSchema.statics.getMonthlyChart = async function(userId, year = new Date().getFullYear()) {
    const startDate = new Date(year, 0, 1); // January 1st
    const endDate = new Date(year + 1, 0, 1); // January 1st next year

    const monthlyData = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                date: { $gte: startDate, $lt: endDate }
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: '$date' },
                    year: { $year: '$date' }
                },
                totalAmount: { $sum: '$amount' },
                totalExpenses: { $sum: 1 },
                categories: {
                    $push: {
                        category: '$category',
                        amount: '$amount'
                    }
                }
            }
        },
        {
            $project: {
                month: '$_id.month',
                year: '$_id.year',
                totalAmount: { $round: ['$totalAmount', 2] },
                totalExpenses: 1,
                categoryBreakdown: {
                    $reduce: {
                        input: '$categories',
                        initialValue: {},
                        in: {
                            $mergeObjects: [
                                '$$value',
                                {
                                    $arrayToObject: [[{
                                        k: '$$this.category',
                                        v: {
                                            $add: [
                                                { $ifNull: [{ $getField: { field: '$$this.category', input: '$$value' } }, 0] },
                                                '$$this.amount'
                                            ]
                                        }
                                    }]]
                                }
                            ]
                        }
                    }
                }
            }
        },
        { $sort: { month: 1 } }
    ]);

    // Fill missing months with 0
    const result = [];
    for (let month = 1; month <= 12; month++) {
        const existingData = monthlyData.find(data => data.month === month);
        result.push({
            month,
            monthName: new Date(year, month - 1).toLocaleString('en', { month: 'short' }),
            totalAmount: existingData ? existingData.totalAmount : 0,
            totalExpenses: existingData ? existingData.totalExpenses : 0,
            categoryBreakdown: existingData ? existingData.categoryBreakdown : {}
        });
    }

    return result;
};

// Static method: get category analytics
expenseSchema.statics.getCategoryAnalytics = async function(userId, startDate, endDate) {
    const matchStage = {
        userId: new mongoose.Types.ObjectId(userId)
    };

    if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = new Date(startDate);
        if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const analytics = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$category',
                totalAmount: { $sum: '$amount' },
                totalExpenses: { $sum: 1 },
                averageAmount: { $avg: '$amount' },
                maxAmount: { $max: '$amount' },
                minAmount: { $min: '$amount' }
            }
        },
        {
            $project: {
                category: '$_id',
                totalAmount: { $round: ['$totalAmount', 2] },
                totalExpenses: 1,
                averageAmount: { $round: ['$averageAmount', 2] },
                maxAmount: { $round: ['$maxAmount', 2] },
                minAmount: { $round: ['$minAmount', 2] }
            }
        },
        { $sort: { totalAmount: -1 } }
    ]);

    return analytics;
};

// Ensure virtual fields are serialized
expenseSchema.set('toJSON', { virtuals: true });
expenseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Expense', expenseSchema);