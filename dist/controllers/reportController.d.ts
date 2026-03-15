import { RequestHandler } from 'express';
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
export declare const submitReport: RequestHandler;
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
export declare const getMyReports: RequestHandler;
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
export declare const getReport: RequestHandler;
//# sourceMappingURL=reportController.d.ts.map