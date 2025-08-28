import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { createComment, deleteComment, updateComment } from '../controllers/commentController.js';

const router = express.Router()

// POST a comments
router.post('/', authMiddleware, createComment)

// DELETE a comment
router.delete('/:id', authMiddleware, deleteComment)
// UPDATE a comment
router.put('/:id', authMiddleware, updateComment)

export default router