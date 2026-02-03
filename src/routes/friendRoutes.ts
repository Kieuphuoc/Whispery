import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
    request,
    respond,
    cancel,
    remove,
    block,
    unblock,
    list,
    pending,
    getStatus,
    getBlockedUsers
} from '../controllers/friendController.js';

const router = express.Router();

// All friend routes require authentication
router.use(authenticate);

// Send friend request
router.post('/request', request);

// Respond to request (accept/reject)
router.post('/request/:id/respond', respond);

// Cancel a sent pending request
router.delete('/request/:id', cancel);

// Remove a friend
router.delete('/remove', remove);

// Block a user
router.post('/block', block);

// Unblock a user
router.post('/unblock', unblock);

// List friends for a user
router.get('/list/:id', list);

// List pending requests (received and sent)
router.get('/pending', pending);

// Get friendship status with another user
router.get('/status/:userId', getStatus);

// List blocked users
router.get('/blocked', getBlockedUsers);

export default router;
