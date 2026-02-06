import { Request, Response, RequestHandler } from 'express';
import prisma from '../prismaClient.js';
import { NotificationType } from '@prisma/client';

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         type:
 *           type: string
 *           enum: [NEW_REACTION, NEW_COMMENT, COMMENT_REPLY, FRIEND_REQUEST, FRIEND_ACCEPTED, ACHIEVEMENT_EARNED, VOICE_DISCOVERED, LEVEL_UP, SYSTEM_MESSAGE]
 *           example: "NEW_COMMENT"
 *         isRead:
 *           type: boolean
 *           example: false
 *         data:
 *           type: object
 *           nullable: true
 *           description: Flexible payload with context (voicePinId, senderId, etc.)
 *           example: { "voicePinId": 5, "senderId": 2, "senderName": "john_doe" }
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         userId:
 *           type: integer
 *           example: 1
 *     NotificationList:
 *       type: object
 *       properties:
 *         notifications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         unreadCount:
 *           type: integer
 */

/**
 * @swagger
 * /notification:
 *   get:
 *     summary: Get all notifications for current user
 *     description: Returns paginated notifications for the authenticated user, sorted by newest first.
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of notifications per page
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filter to show only unread notifications
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationList'
 *       401:
 *         description: Unauthorized
 */
export const getNotifications: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = (req.user as { id: number }).id;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
        const unreadOnly = req.query.unreadOnly === 'true';
        const skip = (page - 1) * limit;

        const where = {
            userId,
            ...(unreadOnly && { isRead: false })
        };

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { userId, isRead: false } })
        ]);

        res.status(200).json({
            notifications,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            unreadCount
        });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /notification/unread:
 *   get:
 *     summary: Get unread notification count
 *     description: Returns the count of unread notifications for the authenticated user.
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unreadCount:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Unauthorized
 */
export const getUnreadCount: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = (req.user as { id: number }).id;

        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false }
        });

        res.status(200).json({ unreadCount });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /notification/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     description: Marks a specific notification as read. Only the notification owner can mark it.
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 */
export const markAsRead: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = (req.user as { id: number }).id;
        const id = Number(req.params.id);

        const notification = await prisma.notification.findFirst({
            where: { id, userId }
        });

        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        res.status(200).json(updated);
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /notification/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     description: Marks all unread notifications as read for the authenticated user.
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All notifications marked as read"
 *                 count:
 *                   type: integer
 *                   description: Number of notifications marked as read
 *                   example: 10
 *       401:
 *         description: Unauthorized
 */
export const markAllAsRead: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = (req.user as { id: number }).id;

        const result = await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });

        res.status(200).json({
            message: 'All notifications marked as read',
            count: result.count
        });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /notification/{id}:
 *   delete:
 *     summary: Delete a notification
 *     description: Deletes a specific notification. Only the notification owner can delete it.
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notification deleted"
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 */
export const deleteNotification: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = (req.user as { id: number }).id;
        const id = Number(req.params.id);

        const notification = await prisma.notification.findFirst({
            where: { id, userId }
        });

        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }

        await prisma.notification.delete({ where: { id } });

        res.status(200).json({ message: 'Notification deleted' });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /notification/clear:
 *   delete:
 *     summary: Clear all read notifications
 *     description: Deletes all read notifications for the authenticated user.
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Read notifications cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Read notifications cleared"
 *                 count:
 *                   type: integer
 *                   description: Number of notifications deleted
 *                   example: 15
 *       401:
 *         description: Unauthorized
 */
export const clearReadNotifications: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = (req.user as { id: number }).id;

        const result = await prisma.notification.deleteMany({
            where: { userId, isRead: true }
        });

        res.status(200).json({
            message: 'Read notifications cleared',
            count: result.count
        });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

// Helper function to create notifications (for use by other controllers)
export const createNotification = async (
    userId: number,
    type: NotificationType,
    data?: object
): Promise<void> => {
    await prisma.notification.create({
        data: {
            userId,
            type,
            ...(data && { data })
        }
    });
};
