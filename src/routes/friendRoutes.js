import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { request, respond, cancel, remove, list, pending } from '../controllers/friendController.js'

const router = express.Router()

router.use(authMiddleware)

// Send friend request
router.post('/request', request)

// Respond to request (accept/reject)
router.post('/request/:id/respond', respond)

// Cancel a sent pending request
router.delete('/request/:id', cancel)

// Remove a friend
router.delete('/remove', remove)

// List friends
router.get('/list/:id', list)

// List pending (received and sent)
router.get('/pending', pending)

export default router


