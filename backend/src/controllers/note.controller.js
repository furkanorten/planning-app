const Note = require('../models/note.model');
const mongoose = require('mongoose');

// Get all notes for a user
exports.getAllNotes = async (req, res) => {
    try {
        const {
            category,
            tags,
            search,
            pinned,
            sortBy = 'updatedAt',
            sortOrder = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        const userId = req.user.userId;

        // If search query provided, use text search
        if (search && search.trim()) {
            const searchResults = await Note.searchNotes(
                userId,
                search.trim(),
                {
                    limit: parseInt(limit),
                    skip: (parseInt(page) - 1) * parseInt(limit)
                }
            );

            return res.status(200).json({
                success: true,
                count: searchResults.length,
                data: searchResults,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        }

        // Build filter for regular queries
        const filter = { userId };

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
            filter.tags = { $in: tagArray };
        }

        if (pinned !== undefined) {
            filter.isPinned = pinned === 'true';
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Pinned notes always come first
        if (sortBy !== 'isPinned') {
            sort.isPinned = -1;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [notes, totalCount] = await Promise.all([
            Note.find(filter)
                .sort(sort)
                .limit(parseInt(limit))
                .skip(skip)
                .lean(),
            Note.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            count: notes.length,
            totalCount,
            data: notes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notes',
            error: error.message
        });
    }
};

// Get recent notes (for dashboard)
exports.getRecentNotes = async (req, res) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 5;

        const recentNotes = await Note.find({ userId })
            .sort({ isPinned: -1, updatedAt: -1 })
            .limit(limit)
            .select('title content category color isPinned createdAt updatedAt')
            .lean();

        res.status(200).json({
            success: true,
            data: recentNotes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent notes',
            error: error.message
        });
    }
};

// Get note by ID
exports.getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid note ID'
            });
        }

        const note = await Note.findOne({ _id: id, userId });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({
            success: true,
            data: note
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch note',
            error: error.message
        });
    }
};

// Create new note
exports.createNote = async (req, res) => {
    try {
        const { title, content, category, tags, color, isPinned } = req.body;
        const userId = req.user.userId;

        // Validation
        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Content is required'
            });
        }

        // Process tags
        const processedTags = tags && Array.isArray(tags)
            ? tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0)
            : [];

        // Create note
        const note = new Note({
            title: title.trim(),
            content: content.trim(),
            category,
            tags: processedTags,
            color,
            isPinned: isPinned || false,
            userId
        });

        await note.save();

        res.status(201).json({
            success: true,
            message: 'Note created successfully',
            data: note
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
            message: 'Failed to create note',
            error: error.message
        });
    }
};

// Update note
exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const updates = { ...req.body };

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid note ID'
            });
        }

        // Process tags if provided
        if (updates.tags && Array.isArray(updates.tags)) {
            updates.tags = updates.tags
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag.length > 0);
        }

        // Find and update note
        const note = await Note.findOneAndUpdate(
            { _id: id, userId },
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Note updated successfully',
            data: note
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
            message: 'Failed to update note',
            error: error.message
        });
    }
};

// Toggle note pin status
exports.togglePin = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid note ID'
            });
        }

        const note = await Note.findOne({ _id: id, userId });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Toggle pin status
        note.isPinned = !note.isPinned;
        await note.save();

        res.status(200).json({
            success: true,
            message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
            data: note
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to toggle pin status',
            error: error.message
        });
    }
};

// Delete note
exports.deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid note ID'
            });
        }

        const note = await Note.findOneAndDelete({ _id: id, userId });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete note',
            error: error.message
        });
    }
};

// Get note statistics
exports.getNoteStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const stats = await Note.getUserStats(userId);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch note statistics',
            error: error.message
        });
    }
};

// Search notes
exports.searchNotes = async (req, res) => {
    try {
        const { q: query, limit = 20, page = 1 } = req.query;
        const userId = req.user.userId;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchResults = await Note.searchNotes(
            userId,
            query.trim(),
            {
                limit: parseInt(limit),
                skip: (parseInt(page) - 1) * parseInt(limit)
            }
        );

        res.status(200).json({
            success: true,
            count: searchResults.length,
            data: searchResults,
            query: query.trim(),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Search failed',
            error: error.message
        });
    }
};