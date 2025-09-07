import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import uploadMiddleware from '../middleware/uploadMiddleware.js'
import logMiddleware from '../middleware/logMiddleware.js'
import { createVoicePin, deleteVoicePin, getComment, getPublicVoicePin, getVoicePin, updateVoicePin } from '../controllers/voiceController.js';

const router = express.Router()

// Get all voice pint for logged-in user
router.get('/',  authMiddleware, getVoicePin)

// GET Public VoicePin
router.get('/public', getPublicVoicePin)

// Create a new Voice Pin 
router.post('/', authMiddleware, uploadMiddleware.single("file"), createVoicePin)

// Update a Voice Pin
router.put('/:id', authMiddleware, uploadMiddleware.single("file"), updateVoicePin)

// Delete a Voice Pin
router.delete('/:id', authMiddleware, deleteVoicePin)

// GET all comments of a voice pin /:id/comment
router.get('/:id/comment',  authMiddleware, getComment)

// thêm xóa sửa reactions


export default router