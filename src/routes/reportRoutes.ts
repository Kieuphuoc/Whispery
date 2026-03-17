import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
    submitReport,
    getMyReports,
    getReport,
    adminGetAllReports,
    adminGetReportStats,
    adminReviewReport,
    adminGetAuditLogs,
    adminUnbanUser
} from '../controllers/reportController.js';

const router = express.Router();

// ── Admin routes (must be before /:id) ────────────────
// TODO: Add admin role middleware when ready
router.get('/admin/all', authenticate, adminGetAllReports);
router.get('/admin/stats', authenticate, adminGetReportStats);
router.get('/admin/audit-logs', authenticate, adminGetAuditLogs);
router.patch('/admin/:id/review', authenticate, adminReviewReport);
router.patch('/admin/unban/:userId', authenticate, adminUnbanUser);

// ── User routes ─────────────────────────────────────
router.post('/', authenticate, submitReport);
router.get('/my', authenticate, getMyReports);
router.get('/:id', authenticate, getReport);

export default router;
