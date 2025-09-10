import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import uploadMiddleware from '../middleware/uploadMiddleware.js'
import logMiddleware from '../middleware/logMiddleware.js'
import { createVoicePin, deleteVoicePin, getComment, getPublicVoicePin, getPublicVoicePinByUser, getRetrieveVoicePin, getVoicePin, updateVoicePin, getMyPublicVoicePins, getFriendsVisibleVoicePins } from '../controllers/voiceController.js';

const router = express.Router()

// Get all voice pint for logged-in user
router.get('/',  authMiddleware, getVoicePin)

// GET Public VoicePin
router.get('/public', getPublicVoicePin)
// GET Public VoicePin of a specific user
router.get('/user/:id/public', getPublicVoicePinByUser)
// GET My Public VoicePins
router.get('/me/public', authMiddleware, getMyPublicVoicePins)
// GET Friends' Public or Friends-Only VoicePins
router.get('/friends', authMiddleware, getFriendsVisibleVoicePins)

// GET Retrieve VoicePin
router.get('/:id', getRetrieveVoicePin);

// Create a new Voice Pin 
router.post('/', authMiddleware, uploadMiddleware.single("file"), createVoicePin)

// Update a Voice Pin
router.put('/:id', authMiddleware, uploadMiddleware.single("file"), updateVoicePin)

// Delete a Voice Pin
router.delete('/:id', authMiddleware, deleteVoicePin)

// GET all comments of a voice pin /:id/comment
router.get('/:id/comment', getComment)

// thêm xóa sửa reactions


export default router