import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getPlatformStats, getPinsHeatmap } from '../controllers/adminStatsController.js';
import { getAllUsers, updateUser } from '../controllers/adminUserController.js';
import { getAllPins, deletePin, updatePinStatus } from '../controllers/adminPinController.js';
const router = express.Router();
// Middleware to authorize all routes in this file
const adminOnly = [authenticate, authorize(['ADMIN', 'MODERATOR'])];
// Stats
router.get('/platform', adminOnly, getPlatformStats);
router.get('/heatmap', adminOnly, getPinsHeatmap);
// Users
router.get('/users', adminOnly, getAllUsers);
router.patch('/users/:id', adminOnly, updateUser);
// Pins
router.get('/pins', adminOnly, getAllPins);
router.delete('/pins/:id', adminOnly, deletePin);
router.patch('/pins/:id/status', adminOnly, updatePinStatus);
export default router;
//# sourceMappingURL=adminStatsRoutes.js.map