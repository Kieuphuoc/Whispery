import { RequestHandler } from 'express';
/**
 * @swagger
 * components:
 *   schemas:
 *     Reaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         type:
 *           type: string
 *           enum: [LIKE, LOVE, LAUGH, SAD, WOW, ANGRY]
 *           example: "LIKE"
 *         userId:
 *           type: integer
 *           example: 1
 *         voicePinId:
 *           type: integer
 *           example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             username:
 *               type: string
 *             displayName:
 *               type: string
 *             avatar:
 *               type: string
 *     ReactionSummary:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 42
 *         byType:
 *           type: object
 *           properties:
 *             LIKE:
 *               type: integer
 *               example: 20
 *             LOVE:
 *               type: integer
 *               example: 10
 *             LAUGH:
 *               type: integer
 *               example: 5
 *             SAD:
 *               type: integer
 *               example: 3
 *             WOW:
 *               type: integer
 *               example: 2
 *             ANGRY:
 *               type: integer
 *               example: 2
 *         userReaction:
 *           type: string
 *           nullable: true
 *           description: The current user's reaction type, if any
 *           example: "LIKE"
 */
/**
 * @swagger
 * /reaction:
 *   post:
 *     summary: Add or update a reaction to a voice pin
 *     description: Creates a new reaction or updates existing one. Each user can only have one reaction per voice pin.
 *     tags: [Reaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voicePinId
 *               - type
 *             properties:
 *               voicePinId:
 *                 type: integer
 *                 description: ID of the voice pin to react to
 *                 example: 5
 *               type:
 *                 type: string
 *                 enum: [LIKE, LOVE, LAUGH, SAD, WOW, ANGRY]
 *                 description: Type of reaction
 *                 example: "LIKE"
 *     responses:
 *       200:
 *         description: Reaction added/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reaction'
 *       400:
 *         description: Bad request or voice pin not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */
export declare const addReaction: RequestHandler;
/**
 * @swagger
 * /reaction/{voicePinId}:
 *   delete:
 *     summary: Remove reaction from a voice pin
 *     description: Removes the current user's reaction from a voice pin.
 *     tags: [Reaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: voicePinId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the voice pin
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reaction removed"
 *       404:
 *         description: Reaction not found
 *       401:
 *         description: Unauthorized
 */
export declare const removeReaction: RequestHandler;
/**
 * @swagger
 * /reaction/voice/{voicePinId}:
 *   get:
 *     summary: Get all reactions for a voice pin
 *     description: Returns all reactions for a specific voice pin with user details.
 *     tags: [Reaction]
 *     parameters:
 *       - in: path
 *         name: voicePinId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the voice pin
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
 *         description: Number of reactions per page
 *     responses:
 *       200:
 *         description: List of reactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reaction'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       400:
 *         description: Bad request
 */
export declare const getReactions: RequestHandler;
/**
 * @swagger
 * /reaction/voice/{voicePinId}/summary:
 *   get:
 *     summary: Get reaction summary for a voice pin
 *     description: Returns reaction counts grouped by type and the current user's reaction if authenticated.
 *     tags: [Reaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: voicePinId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the voice pin
 *     responses:
 *       200:
 *         description: Reaction summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReactionSummary'
 *       400:
 *         description: Bad request
 */
export declare const getReactionSummary: RequestHandler;
//# sourceMappingURL=reactionController.d.ts.map