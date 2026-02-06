import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
    createVoicePin,
    deleteVoicePin,
    getComment,
    getPublicVoicePin,
    getPublicVoicePinByUser,
    getRetrieveVoicePin,
    getVoicePin,
    updateVoicePin,
    getMyPublicVoicePins,
    getFriendsVisibleVoicePins,
    discoverVoice,
    getDiscoverers
} from '../controllers/voiceController.js';

const router = express.Router();

// Get all voice pins for logged-in user
router.get('/', authenticate, getVoicePin);
// GET Public VoicePin
router.get('/public', getPublicVoicePin);
// GET Public VoicePin of a specific user
router.get('/user/:id/public', getPublicVoicePinByUser);
// GET My Public VoicePins
router.get('/me/public', authenticate, getMyPublicVoicePins);
// GET Friends' Public or Friends-Only VoicePins
router.get('/friends', authenticate, getFriendsVisibleVoicePins);
// GET Retrieve VoicePin
router.get('/:id', getRetrieveVoicePin);

// Create a new Voice Pin
router.post('/', authenticate, upload.single('file'), createVoicePin);

// Update a Voice Pin
router.put('/:id', authenticate, upload.single('file'), updateVoicePin);

// Delete a Voice Pin
router.delete('/:id', authenticate, deleteVoicePin);

// GET all comments of a voice pin
router.get('/:id/comment', getComment);

// Discover a hidden voice pin
router.post('/:id/discover', authenticate, discoverVoice);

// Get discoverers of a voice pin
router.get('/:id/discoverers', getDiscoverers);

export default router;
