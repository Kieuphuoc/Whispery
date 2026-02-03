import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
    getMe,
    getUserById,
    updateProfile,
    updateAvatar,
    getUserStats,
    deactivateAccount,
    getMyAchievements,
    getMyDiscoveredVoices,
    getMyViewHistory,
    searchUsers
} from '../controllers/userController.js';

const router = express.Router();

// Public routes
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.get('/:id/stats', getUserStats);

// Protected routes
router.get('/me', authenticate, getMe);
router.get('/me/stats', authenticate, getUserStats);
router.get('/me/achievements', authenticate, getMyAchievements);
router.get('/me/discovered', authenticate, getMyDiscoveredVoices);
router.get('/me/history', authenticate, getMyViewHistory);
router.put('/me', authenticate, updateProfile);
router.put('/me/avatar', authenticate, upload.single('avatar'), updateAvatar);
router.delete('/me', authenticate, deactivateAccount);

export default router;
