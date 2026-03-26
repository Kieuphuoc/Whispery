import { RequestHandler } from 'express';
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
export declare const submitReport: RequestHandler;
/**
 * @swagger
 * /report/my:
 *   get:
 *     summary: Get reports submitted by current user
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 */
export declare const getMyReports: RequestHandler;
/**
 * @swagger
 * /report/{id}:
 *   get:
 *     summary: Get a specific report by ID
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 */
export declare const getReport: RequestHandler;
/**
 * @swagger
 * /report/admin/all:
 *   get:
 *     summary: "[Admin] Get all reports with filters"
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
export declare const adminGetAllReports: RequestHandler;
/**
 * @swagger
 * /report/admin/stats:
 *   get:
 *     summary: "[Admin] Get report statistics"
 *     tags: [Admin]
 */
export declare const adminGetReportStats: RequestHandler;
/**
 * @swagger
 * /report/admin/{id}/review:
 *   patch:
 *     summary: "[Admin] Update report status and resolve"
 *     tags: [Admin]
 */
export declare const adminReviewReport: RequestHandler;
/**
 * @swagger
 * /report/admin/audit-logs:
 *   get:
 *     summary: "[Admin] Get audit logs"
 *     tags: [Admin]
 */
export declare const adminGetAuditLogs: RequestHandler;
/**
 * @swagger
 * /report/admin/unban/{userId}:
 *   patch:
 *     summary: "[Admin] Remove posting ban from user"
 *     tags: [Admin]
 */
export declare const adminUnbanUser: RequestHandler;
//# sourceMappingURL=reportController.d.ts.map