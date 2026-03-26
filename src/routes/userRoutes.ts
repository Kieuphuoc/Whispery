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
    searchUsers,
    changePassword,
    updateCover
} from '../controllers/userController.js';

const router = express.Router();

// Routes
// Protected 'me' routes should come BEFORE parameter routes like '/:id'
router.get('/me', authenticate, getMe);
router.get('/me/stats', authenticate, getUserStats);
router.get('/me/achievements', authenticate, getMyAchievements);
router.get('/me/discovered', authenticate, getMyDiscoveredVoices);
router.get('/me/history', authenticate, getMyViewHistory);
router.put('/me', authenticate, updateProfile);
router.put('/me/avatar', authenticate, upload.single('avatar'), updateAvatar);
router.put('/me/cover', authenticate, upload.single('cover'), updateCover);
router.put('/me/password', authenticate, changePassword);
router.delete('/me', authenticate, deactivateAccount);

// Public routes
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.get('/:id/stats', getUserStats);

export default router;
