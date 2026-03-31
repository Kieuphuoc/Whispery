import { RequestHandler } from 'express';
/**
 * @swagger
 * /chat/rooms:
 *   get:
 *     summary: Get all chat rooms for current user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
export declare const getChatRooms: RequestHandler;
/**
 * @swagger
 * /chat/rooms/{roomId}/messages:
 *   get:
 *     summary: Get messages for a chat room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
export declare const getMessages: RequestHandler;
/**
 * @swagger
 * /chat/private/{targetUserId}:
 *   post:
 *     summary: Get or create a private chat with a user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
export declare const getOrCreatePrivateChat: RequestHandler;
/**
 * @swagger
 * /chat/rooms/{roomId}/send:
 *   post:
 *     summary: Send a message to a chat room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
export declare const sendMessage: RequestHandler;
//# sourceMappingURL=chatController.d.ts.map