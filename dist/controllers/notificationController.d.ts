import { RequestHandler } from 'express';
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
export declare const getNotifications: RequestHandler;
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
export declare const getUnreadCount: RequestHandler;
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
export declare const markAsRead: RequestHandler;
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
export declare const markAllAsRead: RequestHandler;
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
export declare const deleteNotification: RequestHandler;
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
export declare const clearReadNotifications: RequestHandler;
export declare const createNotification: (userId: number, type: NotificationType, data?: object) => Promise<void>;
//# sourceMappingURL=notificationController.d.ts.map