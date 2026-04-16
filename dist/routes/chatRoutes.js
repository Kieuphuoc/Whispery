import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getChatRooms, getMessages, getOrCreatePrivateChat, sendMessage } from '../controllers/chatController.js';
const router = express.Router();
router.get('/rooms', authenticate, getChatRooms);
router.get('/rooms/:roomId/messages', authenticate, getMessages);
router.post('/rooms/:roomId/send', authenticate, sendMessage);
router.post('/private/:targetUserId', authenticate, getOrCreatePrivateChat);
export default router;
//# sourceMappingURL=chatRoutes.js.map