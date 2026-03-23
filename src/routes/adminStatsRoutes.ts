import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getPlatformStats, getPinsHeatmap } from '../controllers/adminStatsController.js';
import { getAllUsers, updateUser } from '../controllers/adminUserController.js';
import { getAllPins, deletePin } from '../controllers/adminPinController.js';

const router = express.Router();

// Stats
router.get('/platform', authenticate, getPlatformStats);
router.get('/heatmap', authenticate, getPinsHeatmap);

// Users
router.get('/users', authenticate, getAllUsers);
router.patch('/users/:id', authenticate, updateUser);

// Pins
router.get('/pins', authenticate, getAllPins);
router.delete('/pins/:id', authenticate, deletePin);

export default router;
