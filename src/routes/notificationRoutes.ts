import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications
} from '../controllers/notificationController.js';

const router = express.Router();

// Get all notifications (paginated)
router.get('/', authenticate, getNotifications);

// Get unread count
router.get('/unread', authenticate, getUnreadCount);

// Mark all notifications as read
router.put('/read-all', authenticate, markAllAsRead);

// Clear all read notifications
router.delete('/clear', authenticate, clearReadNotifications);

// Mark a specific notification as read
router.put('/:id/read', authenticate, markAsRead);

// Delete a specific notification
router.delete('/:id', authenticate, deleteNotification);

export default router;
