import { Request, Response, RequestHandler } from 'express';
import prisma from '../prismaClient.js';
import { ReportReason } from '@prisma/client';

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         reason:
 *           type: string
 *           enum: [SPAM, HARASSMENT, HATE_SPEECH, VIOLENCE, NUDITY, MISINFORMATION, COPYRIGHT, OTHER]
 *           example: "SPAM"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Additional details from reporter
 *           example: "This voice pin contains spam content"
 *         status:
 *           type: string
 *           enum: [PENDING, UNDER_REVIEW, RESOLVED, DISMISSED]
 *           example: "PENDING"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         reporterId:
 *           type: integer
 *           example: 1
 *         voicePinId:
 *           type: integer
 *           example: 5
 *         voicePin:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             content:
 *               type: string
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 */

/**
 * @swagger
 * /report:
 *   post:
 *     summary: Submit a report for a voice pin
 *     description: Creates a new report for a voice pin. Users cannot report their own voice pins or report the same voice pin twice.
 *     tags: [Report]
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
 *               - reason
 *             properties:
 *               voicePinId:
 *                 type: integer
 *                 description: ID of the voice pin to report
 *                 example: 5
 *               reason:
 *                 type: string
 *                 enum: [SPAM, HARASSMENT, HATE_SPEECH, VIOLENCE, NUDITY, MISINFORMATION, COPYRIGHT, OTHER]
 *                 description: Reason for the report
 *                 example: "SPAM"
 *               description:
 *                 type: string
 *                 description: Additional details (optional)
 *                 example: "This voice pin contains promotional spam"
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       400:
 *         description: Bad request (already reported, own voice pin, etc.)
 *       404:
 *         description: Voice pin not found
 *       401:
 *         description: Unauthorized
 */
export const submitReport: RequestHandler = async (req, res): Promise<void> => {
    try {
        const reporterId = (req.user as { id: number }).id;
        const { voicePinId, reason, description } = req.body;

        if (!voicePinId || !reason) {
            res.status(400).json({ message: 'voicePinId and reason are required' });
            return;
        }

        // Validate reason
        if (!Object.values(ReportReason).includes(reason)) {
            res.status(400).json({ message: 'Invalid report reason' });
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

        // Cannot report own voice pin
        if (voicePin.userId === reporterId) {
            res.status(400).json({ message: 'Cannot report your own voice pin' });
            return;
        }

        // Check for existing report
        const existingReport = await prisma.report.findFirst({
            where: {
                reporterId,
                voicePinId: Number(voicePinId)
            }
        });

        if (existingReport) {
            res.status(400).json({ message: 'You have already reported this voice pin' });
            return;
        }

        const report = await prisma.report.create({
            data: {
                reporterId,
                voicePinId: Number(voicePinId),
                reason,
                description: description ?? null
            },
            include: {
                voicePin: {
                    select: {
                        id: true,
                        content: true,
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json(report);
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /report/my:
 *   get:
 *     summary: Get reports submitted by current user
 *     description: Returns all reports submitted by the authenticated user, sorted by newest first.
 *     tags: [Report]
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
 *         description: Number of reports per page
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
export const getMyReports: RequestHandler = async (req, res): Promise<void> => {
    try {
        const reporterId = (req.user as { id: number }).id;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where: { reporterId },
                include: {
                    voicePin: {
                        select: {
                            id: true,
                            content: true,
                            user: {
                                select: {
                                    id: true,
                                    username: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.report.count({ where: { reporterId } })
        ]);

        res.status(200).json({
            reports,
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
 * /report/{id}:
 *   get:
 *     summary: Get a specific report by ID
 *     description: Returns a specific report. Only the reporter can view their own report.
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       404:
 *         description: Report not found
 *       401:
 *         description: Unauthorized
 */
export const getReport: RequestHandler = async (req, res): Promise<void> => {
    try {
        const reporterId = (req.user as { id: number }).id;
        const id = Number(req.params.id);

        const report = await prisma.report.findFirst({
            where: { id, reporterId },
            include: {
                voicePin: {
                    select: {
                        id: true,
                        content: true,
                        audioUrl: true,
                        user: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true
                            }
                        }
                    }
                }
            }
        });

        if (!report) {
            res.status(404).json({ message: 'Report not found' });
            return;
        }

        res.status(200).json(report);
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};
