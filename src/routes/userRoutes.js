import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'
import { getMe, getUserById, updateProfile, updateAvatar, getUserStats } from '../controllers/userController.js'

const router = express.Router()

router.get('/me', getMe)
router.get('/:id', getUserById)
router.get('/:id/stats', getUserStats)
router.get('/me/stats', getUserStats)
router.put('/me', authMiddleware, updateProfile)
router.put('/me/avatar', authMiddleware, upload.single('avatar'), updateAvatar)
//?

export default router


