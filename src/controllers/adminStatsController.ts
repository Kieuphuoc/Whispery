import { Request, Response, RequestHandler } from 'express';
import prisma from '../prismaClient.js';

/**
 * Get platform-wide statistics for the admin dashboard.
 * Includes total users, total pins, and emotion distribution.
 */
export const getPlatformStats: RequestHandler = async (_req, res): Promise<void> => {
    try {
        const [totalUsers, totalPins, emotions] = await Promise.all([
            prisma.user.count({ where: { deletedAt: null } }),
            prisma.voicePin.count({ where: { deletedAt: null } }),
            prisma.voicePin.groupBy({
                by: ['emotionLabel'],
                where: { deletedAt: null, NOT: { emotionLabel: null } },
                _count: { emotionLabel: true }
            })
        ]);

        res.status(200).json({
            users: totalUsers,
            pins: totalPins,
            emotions: emotions.map(e => ({
                label: e.emotionLabel,
                count: e._count.emotionLabel
            }))
        });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get all pins' locations and emotions for the heatmap.
 */
export const getPinsHeatmap: RequestHandler = async (_req, res): Promise<void> => {
    try {
        const pins: any[] = await prisma.$queryRaw`
            SELECT 
                id,
                "emotionLabel",
                ST_Y(location) as latitude,
                ST_X(location) as longitude
            FROM "VoicePin"
            WHERE "deletedAt" IS NULL
        `;

        res.status(200).json({ pins });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ message: error.message });
    }
};
