import prisma from '../prismaClient.js';
import { ReportReason, ReportStatus, NotificationType } from '@prisma/client';
import { createNotification } from './notificationController.js';
// ─── Helper: count resolved violations for a user ───────────────────────────
async function countViolations(userId) {
    return prisma.report.count({
        where: {
            voicePin: { userId },
            status: 'RESOLVED'
        }
    });
}
// ─── Helper: create audit log ───────────────────────────────────────────────
async function createAuditLog(adminId, action, targetType, targetId, details) {
    await prisma.auditLog.create({
        data: { adminId, action, targetType, targetId, details: details ?? {} }
    });
}
/**
 * @swagger
 * /report:
 *   post:
 *     summary: Submit a report for a voice pin
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [voicePinId, reason]
 *             properties:
 *               voicePinId:
 *                 type: integer
 *               reason:
 *                 type: string
 *                 enum: [SPAM, HARASSMENT, HATE_SPEECH, VIOLENCE, NUDITY, MISINFORMATION, COPYRIGHT, OTHER]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Voice pin not found
 */
export const submitReport = async (req, res) => {
    try {
        const reporterId = req.user.id;
        const { voicePinId, reason, description } = req.body;
        if (!voicePinId || !reason) {
            res.status(400).json({ message: 'voicePinId and reason are required' });
            return;
        }
        if (!Object.values(ReportReason).includes(reason)) {
            res.status(400).json({ message: 'Invalid report reason' });
            return;
        }
        const voicePin = await prisma.voicePin.findUnique({
            where: { id: Number(voicePinId), deletedAt: null },
            include: { user: { select: { id: true, username: true } } }
        });
        if (!voicePin) {
            res.status(404).json({ message: 'Voice pin not found' });
            return;
        }
        if (voicePin.userId === reporterId) {
            res.status(400).json({ message: 'Cannot report your own voice pin' });
            return;
        }
        const existingReport = await prisma.report.findFirst({
            where: { reporterId, voicePinId: Number(voicePinId) }
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
                description: description ?? null,
                violationTags: [reason],
            },
            include: {
                voicePin: {
                    select: { id: true, content: true, user: { select: { id: true, username: true } } }
                }
            }
        });
        // Notify the author of the voicePin
        await createNotification(voicePin.userId, NotificationType.VOICE_REPORTED, {
            reportId: report.id,
            voicePinId: voicePin.id,
            reason,
            message: `Bài đăng của bạn đã bị báo cáo vi phạm nội dung: ${reason}`
        });
        res.status(201).json(report);
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /report/my:
 *   get:
 *     summary: Get reports submitted by current user
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 */
export const getMyReports = async (req, res) => {
    try {
        const reporterId = req.user.id;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where: { reporterId },
                include: {
                    voicePin: {
                        select: { id: true, content: true, user: { select: { id: true, username: true } } }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.report.count({ where: { reporterId } })
        ]);
        res.status(200).json({ reports, total, page, totalPages: Math.ceil(total / limit) });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /report/{id}:
 *   get:
 *     summary: Get a specific report by ID
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 */
export const getReport = async (req, res) => {
    try {
        const reporterId = req.user.id;
        const id = Number(req.params.id);
        const report = await prisma.report.findFirst({
            where: { id, reporterId },
            include: {
                voicePin: {
                    select: {
                        id: true, content: true, audioUrl: true, transcription: true,
                        user: { select: { id: true, username: true, displayName: true } }
                    }
                }
            }
        });
        if (!report) {
            res.status(404).json({ message: 'Report not found' });
            return;
        }
        res.status(200).json(report);
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /report/admin/all:
 *   get:
 *     summary: "[Admin] Get all reports with filters"
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
export const adminGetAllReports = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const status = req.query.status;
        const reason = req.query.reason;
        const where = {};
        if (status && Object.values(ReportStatus).includes(status))
            where.status = status;
        if (reason && Object.values(ReportReason).includes(reason))
            where.reason = reason;
        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where,
                include: {
                    reporter: { select: { id: true, username: true, displayName: true, avatar: true } },
                    voicePin: {
                        select: {
                            id: true, content: true, audioUrl: true, transcription: true,
                            emotionLabel: true, emotionScore: true,
                            user: { select: { id: true, username: true, displayName: true, avatar: true, postingBanned: true } }
                        }
                    },
                    resolvedBy: { select: { id: true, username: true, displayName: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.report.count({ where })
        ]);
        // Violation count per voicePin owner
        const enriched = await Promise.all(reports.map(async (r) => {
            const violationCount = await countViolations(r.voicePin.user.id);
            return { ...r, violationCount };
        }));
        res.status(200).json({ reports: enriched, total, page, totalPages: Math.ceil(total / limit) });
    }
    catch (err) {
        const error = err;
        res.status(500).json({ message: error.message });
    }
};
/**
 * @swagger
 * /report/admin/stats:
 *   get:
 *     summary: "[Admin] Get report statistics"
 *     tags: [Admin]
 */
export const adminGetReportStats = async (req, res) => {
    try {
        const [totalPending, totalUnderReview, totalResolved, totalDismissed, byReason] = await Promise.all([
            prisma.report.count({ where: { status: 'PENDING' } }),
            prisma.report.count({ where: { status: 'UNDER_REVIEW' } }),
            prisma.report.count({ where: { status: 'RESOLVED' } }),
            prisma.report.count({ where: { status: 'DISMISSED' } }),
            prisma.report.groupBy({ by: ['reason'], _count: { reason: true } })
        ]);
        res.status(200).json({
            pending: totalPending,
            underReview: totalUnderReview,
            resolved: totalResolved,
            dismissed: totalDismissed,
            total: totalPending + totalUnderReview + totalResolved + totalDismissed,
            byReason: byReason.map(r => ({ reason: r.reason, count: r._count.reason }))
        });
    }
    catch (err) {
        const error = err;
        res.status(500).json({ message: error.message });
    }
};
/**
 * @swagger
 * /report/admin/{id}/review:
 *   patch:
 *     summary: "[Admin] Update report status and resolve"
 *     tags: [Admin]
 */
export const adminReviewReport = async (req, res) => {
    try {
        const adminId = req.user.id;
        const id = Number(req.params.id);
        const { status, moderatorNote, violationTags, violationScore } = req.body;
        if (!status || !Object.values(ReportStatus).includes(status)) {
            res.status(400).json({ message: 'Valid status is required' });
            return;
        }
        const report = await prisma.report.findUnique({
            where: { id },
            include: {
                voicePin: { select: { id: true, userId: true, content: true } }
            }
        });
        if (!report) {
            res.status(404).json({ message: 'Report not found' });
            return;
        }
        const oldStatus = report.status;
        const updated = await prisma.report.update({
            where: { id },
            data: {
                status,
                moderatorNote: moderatorNote ?? report.moderatorNote,
                violationTags: violationTags ?? report.violationTags,
                violationScore: violationScore ?? report.violationScore,
                resolvedById: adminId,
                resolvedAt: ['RESOLVED', 'DISMISSED'].includes(status) ? new Date() : report.resolvedAt
            }
        });
        // Audit log
        await createAuditLog(adminId, `REPORT_${status}`, 'Report', id, {
            oldStatus,
            newStatus: status,
            voicePinId: report.voicePinId,
            moderatorNote,
            violationTags,
            violationScore
        });
        // If RESOLVED → check violation count → maybe ban
        if (status === 'RESOLVED') {
            const violationCount = await countViolations(report.voicePin.userId);
            // Notify reported user
            await createNotification(report.voicePin.userId, NotificationType.VOICE_REPORTED, {
                reportId: id,
                voicePinId: report.voicePinId,
                message: `Bài đăng của bạn đã bị xác nhận vi phạm. Tổng vi phạm: ${violationCount}/3`,
                violationCount
            });
            if (violationCount >= 3) {
                await prisma.user.update({
                    where: { id: report.voicePin.userId },
                    data: { postingBanned: true }
                });
                await createNotification(report.voicePin.userId, NotificationType.POSTING_BANNED, {
                    message: 'Tài khoản của bạn đã bị khóa quyền đăng bài do vi phạm chính sách 3 lần.',
                    violationCount
                });
                await createAuditLog(adminId, 'USER_POSTING_BANNED', 'User', report.voicePin.userId, {
                    reason: 'Exceeded 3 violations',
                    violationCount,
                    triggeredByReport: id
                });
            }
        }
        res.status(200).json(updated);
    }
    catch (err) {
        const error = err;
        res.status(500).json({ message: error.message });
    }
};
/**
 * @swagger
 * /report/admin/audit-logs:
 *   get:
 *     summary: "[Admin] Get audit logs"
 *     tags: [Admin]
 */
export const adminGetAuditLogs = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                include: {
                    admin: { select: { id: true, username: true, displayName: true, avatar: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.auditLog.count()
        ]);
        res.status(200).json({ logs, total, page, totalPages: Math.ceil(total / limit) });
    }
    catch (err) {
        const error = err;
        res.status(500).json({ message: error.message });
    }
};
/**
 * @swagger
 * /report/admin/unban/{userId}:
 *   patch:
 *     summary: "[Admin] Remove posting ban from user"
 *     tags: [Admin]
 */
export const adminUnbanUser = async (req, res) => {
    try {
        const adminId = req.user.id;
        const userId = Number(req.params.userId);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await prisma.user.update({ where: { id: userId }, data: { postingBanned: false } });
        await createAuditLog(adminId, 'USER_POSTING_UNBANNED', 'User', userId, {
            reason: 'Admin manually removed posting ban'
        });
        await createNotification(userId, NotificationType.SYSTEM_MESSAGE, {
            message: 'Quyền đăng bài của bạn đã được khôi phục bởi quản trị viên.'
        });
        res.status(200).json({ message: 'User posting ban removed' });
    }
    catch (err) {
        const error = err;
        res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=reportController.js.map