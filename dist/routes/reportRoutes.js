import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { submitReport, getMyReports, getReport, adminGetAllReports, adminGetReportStats, adminReviewReport, adminGetAuditLogs, adminUnbanUser } from '../controllers/reportController.js';
const router = express.Router();
// Middleware to authorize admin routes
const adminOnly = [authenticate, authorize(['ADMIN', 'MODERATOR'])];
// ── Admin routes (must be before /:id) ────────────────
router.get('/admin/all', adminOnly, adminGetAllReports);
router.get('/admin/stats', adminOnly, adminGetReportStats);
router.get('/admin/audit-logs', adminOnly, adminGetAuditLogs);
router.patch('/admin/:id/review', adminOnly, adminReviewReport);
router.patch('/admin/unban/:userId', adminOnly, adminUnbanUser);
// ── User routes ─────────────────────────────────────
router.post('/', authenticate, submitReport);
router.get('/my', authenticate, getMyReports);
router.get('/:id', authenticate, getReport);
export default router;
//# sourceMappingURL=reportRoutes.js.map