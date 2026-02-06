import { Request, Response, RequestHandler } from 'express';
import prisma from '../prismaClient.js';
import { ReactionType } from '@prisma/client';

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
export const addReaction: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = (req.user as { id: number }).id;
        const { voicePinId, type } = req.body;

        if (!voicePinId || !type) {
            res.status(400).json({ message: 'voicePinId and type are required' });
            return;
        }

        // Validate reaction type
        if (!Object.values(ReactionType).includes(type)) {
            res.status(400).json({ message: 'Invalid reaction type' });
            return;
        }

        // Check if voice pin exists
        const voicePin = await prisma.voicePin.findUnique({
            where: { id: Number(voicePinId), deletedAt: null }
        });

        if (!voicePin) {
            res.status(404).json({ message: 'Voice pin not found' });
            return;
        }

        // Upsert reaction (create or update)
        const reaction = await prisma.reaction.upsert({
            where: {
                userId_voicePinId: {
                    userId,
                    voicePinId: Number(voicePinId)
                }
            },
            update: { type },
            create: {
                userId,
                voicePinId: Number(voicePinId),
                type
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true
                    }
                }
            }
        });

        // Update denormalized count
        const count = await prisma.reaction.count({
            where: { voicePinId: Number(voicePinId) }
        });
        await prisma.voicePin.update({
            where: { id: Number(voicePinId) },
            data: { reactionsCount: count }
        });

        res.status(200).json(reaction);
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

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
export const removeReaction: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = (req.user as { id: number }).id;
        const voicePinId = Number(req.params.voicePinId);

        // Check if reaction exists
        const existing = await prisma.reaction.findUnique({
            where: {
                userId_voicePinId: { userId, voicePinId }
            }
        });

        if (!existing) {
            res.status(404).json({ message: 'Reaction not found' });
            return;
        }

        await prisma.reaction.delete({
            where: {
                userId_voicePinId: { userId, voicePinId }
            }
        });

        // Update denormalized count
        const count = await prisma.reaction.count({
            where: { voicePinId }
        });
        await prisma.voicePin.update({
            where: { id: voicePinId },
            data: { reactionsCount: count }
        });

        res.status(200).json({ message: 'Reaction removed' });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

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
export const getReactions: RequestHandler = async (req, res): Promise<void> => {
    try {
        const voicePinId = Number(req.params.voicePinId);
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [reactions, total] = await Promise.all([
            prisma.reaction.findMany({
                where: { voicePinId },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatar: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.reaction.count({ where: { voicePinId } })
        ]);

        res.status(200).json({
            reactions,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

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
export const getReactionSummary: RequestHandler = async (req, res): Promise<void> => {
    try {
        const voicePinId = Number(req.params.voicePinId);
        const userId = (req.user as { id: number } | undefined)?.id;

        // Get counts by type
        const counts = await prisma.reaction.groupBy({
            by: ['type'],
            where: { voicePinId },
            _count: { type: true }
        });

        // Build summary object
        const byType: Record<string, number> = {
            LIKE: 0,
            LOVE: 0,
            LAUGH: 0,
            SAD: 0,
            WOW: 0,
            ANGRY: 0
        };

        let total = 0;
        for (const item of counts) {
            byType[item.type] = item._count.type;
            total += item._count.type;
        }

        // Get user's reaction if authenticated
        let userReaction: string | null = null;
        if (userId) {
            const reaction = await prisma.reaction.findUnique({
                where: {
                    userId_voicePinId: { userId, voicePinId }
                }
            });
            userReaction = reaction?.type ?? null;
        }

        res.status(200).json({
            total,
            byType,
            userReaction
        });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};
