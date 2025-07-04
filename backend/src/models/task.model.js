const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    completed: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        required: true,
        enum: ['personal', 'work', 'health', 'education', 'other'],
        default: 'personal'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    deadline: {
        type: Date,
        validate: {
            validator: function(date) {
                // Deadline geçmiş tarih olamaz (opsiyonel validasyon)
                return !date || date >= new Date();
            },
            message: 'Deadline cannot be in the past'
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true // createdAt ve updatedAt otomatik ekler
});

// Index for better query performance
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, deadline: 1 });

// Virtual property: is task overdue?
taskSchema.virtual('isOverdue').get(function() {
    if (!this.deadline || this.completed) return false;
    return new Date() > this.deadline;
});

// Virtual property: days until deadline
taskSchema.virtual('daysUntilDeadline').get(function() {
    if (!this.deadline || this.completed) return null;
    const now = new Date();
    const deadline = new Date(this.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Pre-save middleware: set completedAt when task is completed
taskSchema.pre('save', function(next) {
    if (this.completed && !this.completedAt) {
        this.completedAt = new Date();
    } else if (!this.completed) {
        this.completedAt = undefined;
    }
    next();
});

// Static method: get user's task stats
taskSchema.statics.getUserStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                completedTasks: {
                    $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
                },
                overdueTasks: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $ne: ['$deadline', null] },
                                    { $eq: ['$completed', false] },
                                    { $lt: ['$deadline', new Date()] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                dueTodayTasks: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $ne: ['$deadline', null] },
                                    { $eq: ['$completed', false] },
                                    {
                                        $gte: ['$deadline', new Date(new Date().setHours(0,0,0,0))]
                                    },
                                    {
                                        $lt: ['$deadline', new Date(new Date().setHours(23,59,59,999))]
                                    }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);

    return stats[0] || {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        dueTodayTasks: 0
    };
};

// Ensure virtual fields are serialized
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);