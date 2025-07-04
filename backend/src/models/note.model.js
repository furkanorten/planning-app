const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10000 // 10K karakter limit
    },
    category: {
        type: String,
        enum: ['personal', 'work', 'ideas', 'reminders', 'other'],
        default: 'personal'
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 50
    }],
    color: {
        type: String,
        enum: ['yellow', 'blue', 'green', 'pink', 'purple', 'orange', 'gray'],
        default: 'yellow'
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for better query performance
noteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ userId: 1, category: 1 });
noteSchema.index({ userId: 1, tags: 1 });

// Text index for search functionality
noteSchema.index({
    title: 'text',
    content: 'text',
    tags: 'text'
}, {
    weights: {
        title: 10,
        tags: 5,
        content: 1
    }
});

// Virtual property: note preview (first 100 characters)
noteSchema.virtual('preview').get(function() {
    if (!this.content) return '';
    return this.content.length > 100
        ? this.content.substring(0, 100) + '...'
        : this.content;
});

// Virtual property: word count
noteSchema.virtual('wordCount').get(function() {
    if (!this.content) return 0;
    return this.content.trim().split(/\s+/).length;
});

// Static method: get user's note stats
noteSchema.statics.getUserStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalNotes: { $sum: 1 },
                pinnedNotes: {
                    $sum: { $cond: [{ $eq: ['$isPinned', true] }, 1, 0] }
                },
                categoryBreakdown: {
                    $push: '$category'
                }
            }
        },
        {
            $project: {
                totalNotes: 1,
                pinnedNotes: 1,
                categoryBreakdown: {
                    $reduce: {
                        input: '$categoryBreakdown',
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
        totalNotes: 0,
        pinnedNotes: 0,
        categoryBreakdown: {}
    };

    return result;
};

// Static method: search notes
noteSchema.statics.searchNotes = async function(userId, searchQuery, options = {}) {
    const { limit = 20, skip = 0 } = options;

    const searchResults = await this.find({
        userId: new mongoose.Types.ObjectId(userId),
        $text: { $search: searchQuery }
    })
        .select('title content category tags color isPinned createdAt updatedAt')
        .sort({ score: { $meta: 'textScore' }, updatedAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

    return searchResults;
};

// Ensure virtual fields are serialized
noteSchema.set('toJSON', { virtuals: true });
noteSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Note', noteSchema);