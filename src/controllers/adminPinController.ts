import { Request, Response, RequestHandler } from 'express';
import prisma from '../prismaClient.js';

/**
 * Get all pins with emotion and content filters.
 */
export const getAllPins: RequestHandler = async (req, res): Promise<void> => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const search = req.query.search as string;
        const emotion = req.query.emotion as string;

        const where: any = { deletedAt: null };
        if (search) {
            where.content = { contains: search, mode: 'insensitive' };
        }
        if (emotion) {
            where.emotionLabel = emotion;
        }

        const [pins, total] = await Promise.all([
            prisma.voicePin.findMany({
                where,
                include: {
                    user: { select: { id: true, username: true, avatar: true } },
                    images: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.voicePin.count({ where })
        ]);

        res.status(200).json({ pins, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete a voice pin (Admin action).
 */
export const deletePin: RequestHandler = async (req, res): Promise<void> => {
    try {
        const id = Number(req.params.id);
        await prisma.voicePin.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        res.status(200).json({ message: 'Voice pin deleted successfully' });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ message: error.message });
    }
};
