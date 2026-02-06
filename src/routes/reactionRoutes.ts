import express from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware.js';
import {
    addReaction,
    removeReaction,
    getReactions,
    getReactionSummary
} from '../controllers/reactionController.js';

const router = express.Router();

// Add or update a reaction
router.post('/', authenticate, addReaction);

// Remove a reaction
router.delete('/:voicePinId', authenticate, removeReaction);

// Get all reactions for a voice pin
router.get('/voice/:voicePinId', getReactions);

// Get reaction summary for a voice pin (with optional auth for user's reaction)
router.get('/voice/:voicePinId/summary', optionalAuthenticate, getReactionSummary);

export default router;
