const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const noteController = require('../controllers/note.controller');

// All note routes require authentication
router.use(authMiddleware);

// GET /api/notes - Get all notes for user (with filtering, search, pagination)
router.get('/', noteController.getAllNotes);

// GET /api/notes/recent - Get recent notes for dashboard
router.get('/recent', noteController.getRecentNotes);

// GET /api/notes/stats - Get note statistics
router.get('/stats', noteController.getNoteStats);

// GET /api/notes/search - Search notes
router.get('/search', noteController.searchNotes);

// GET /api/notes/:id - Get specific note
router.get('/:id', noteController.getNoteById);

// POST /api/notes - Create new note
router.post('/', noteController.createNote);

// PUT /api/notes/:id - Update note
router.put('/:id', noteController.updateNote);

// PATCH /api/notes/:id/pin - Toggle note pin status
router.patch('/:id/pin', noteController.togglePin);

// DELETE /api/notes/:id - Delete note
router.delete('/:id', noteController.deleteNote);

module.exports = router;