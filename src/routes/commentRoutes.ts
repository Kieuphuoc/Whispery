import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
    createComment,
    getComment,
    deleteComment,
    updateComment,
    getCommentsByVoicePin,
    getReplies
} from '../controllers/commentController.js';

const router = express.Router();

// Get comments for a voice pin (public)
router.get('/voice/:voicePinId', getCommentsByVoicePin);

// Get a specific comment (public)
router.get('/:id', getComment);

// Get replies to a comment (public)
router.get('/:id/replies', getReplies);

// Create a comment (with optional voice)
router.post('/', authenticate, upload.single('file'), createComment);

// Update a comment
router.put('/:id', authenticate, updateComment);

// Delete a comment (soft delete)
router.delete('/:id', authenticate, deleteComment);

export default router;
