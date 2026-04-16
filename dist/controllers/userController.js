import prisma from '../prismaClient.js';
import { uploadToAzure } from '../configs/azureStorage.js';
import { UserStatus } from '@prisma/client';
/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: "john_doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         displayName:
 *           type: string
 *           nullable: true
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: "https://whisper.blob.core.windows.net/whisper/avatars/avatar.jpg"
 *         bio:
 *           type: string
 *           nullable: true
 *           example: "Voice pin enthusiast 🎤"
 *         level:
 *           type: integer
 *           description: User's gamification level
 *           example: 5
 *         xp:
 *           type: integer
 *           description: Experience points
 *           example: 1250
 *         scanRadius:
 *           type: integer
 *           description: Scan radius in meters (increases with level)
 *           example: 1500
 *         status:
 *           type: string
 *           enum: [ACTIVE, SUSPENDED, BANNED, DEACTIVATED]
 *           example: "ACTIVE"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         isPublicAccount:
 *           type: boolean
 *           example: true
 *         searchable:
 *           type: boolean
 *           example: true
 *         liveLocation:
 *           type: boolean
 *           example: false
 *         sharingLevel:
 *           type: string
 *           enum: [EVERYONE, FRIENDS, NONE]
 *           example: "FRIENDS"
 *         showActiveStatus:
 *           type: boolean
 *           example: true
 *         showTypingStatus:
 *           type: boolean
 *           example: true
 *     UserPublic:
 *       type: object
 *       description: Public user information visible to other users
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: "john_doe"
 *         displayName:
 *           type: string
 *           nullable: true
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: "https://res.cloudinary.com/xxx/avatar.jpg"
 *         bio:
 *           type: string
 *           nullable: true
 *           example: "Voice pin enthusiast 🎤"
 *         level:
 *           type: integer
 *           example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *     UserStats:
 *       type: object
 *       properties:
 *         level:
 *           type: integer
 *           description: Current user level
 *           example: 5
 *         xp:
 *           type: integer
 *           description: Total experience points
 *           example: 1250
 *         scanRadius:
 *           type: integer
 *           description: Current scan radius in meters
 *           example: 1500
 *         friendCount:
 *           type: integer
 *           description: Number of friends
 *           example: 42
 *         voicePinCount:
 *           type: integer
 *           description: Number of voice pins created
 *           example: 15
 *         totalListens:
 *           type: integer
 *           description: Total listens across all voice pins
 *           example: 523
 *         achievementCount:
 *           type: integer
 *           description: Number of achievements earned
 *           example: 8
 *         discoveredVoicesCount:
 *           type: integer
 *           description: Number of hidden voices discovered
 *           example: 3
 *     Achievement:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *           example: 1
 *         achievementId:
 *           type: integer
 *           example: 5
 *         earnedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-10T15:30:00.000Z"
 *         achievement:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 5
 *             name:
 *               type: string
 *               example: "Explorer Beginner"
 *             description:
 *               type: string
 *               example: "Discover your first hidden voice pin"
 *             iconUrl:
 *               type: string
 *               example: "https://whisper.blob.core.windows.net/whisper/achievements/achievement.png"
 *             xpReward:
 *               type: integer
 *               example: 50
 *     DiscoveredVoice:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         discoveredAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-12T14:20:00.000Z"
 *         userId:
 *           type: integer
 *           example: 1
 *         voicePinId:
 *           type: integer
 *           example: 15
 *         voicePin:
 *           type: object
 *           description: The discovered voice pin details
 *     ViewHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         viewedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00.000Z"
 *         userId:
 *           type: integer
 *           example: 1
 *         voicePinId:
 *           type: integer
 *           example: 10
 *         voicePin:
 *           type: object
 *           description: The viewed voice pin details
 */
/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the authenticated user's full profile including gamification stats and account status.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile with gamification stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *             example:
 *               data:
 *                 id: 1
 *                 username: "john_doe"
 *                 email: "john@example.com"
 *                 displayName: "John Doe"
 *                 avatar: "https://res.cloudinary.com/xxx/avatar.jpg"
 *                 bio: "Voice pin enthusiast 🎤"
 *                 level: 5
 *                 xp: 1250
 *                 scanRadius: 1500
 *                 status: "ACTIVE"
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "User not found"
 */
export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id, deletedAt: null },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                avatar: true,
                cover: true,
                bio: true,
                // Gamification stats
                level: true,
                xp: true,
                scanRadius: true,
                // Account status
                status: true,
                createdAt: true,
                updatedAt: true,
                // Settings & Privacy
                isPublicAccount: true,
                searchable: true,
                liveLocation: true,
                sharingLevel: true,
                showActiveStatus: true,
                showTypingStatus: true
            }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ data: user });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Returns public profile information for a specific user. Only shows active, non-deleted users.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User public profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/UserPublic'
 *             example:
 *               data:
 *                 id: 1
 *                 username: "john_doe"
 *                 displayName: "John Doe"
 *                 avatar: "https://res.cloudinary.com/xxx/avatar.jpg"
 *                 bio: "Voice pin enthusiast 🎤"
 *                 level: 5
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "User not found"
 */
export const getUserById = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id), deletedAt: null, status: UserStatus.ACTIVE },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                cover: true,
                bio: true,
                // Gamification (public)
                level: true,
                createdAt: true
            }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ data: user });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /user/{id}/stats:
 *   get:
 *     summary: Get user statistics
 *     description: Returns comprehensive statistics for a user including gamification data, social stats, and achievements.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/UserStats'
 *             example:
 *               data:
 *                 level: 5
 *                 xp: 1250
 *                 scanRadius: 1500
 *                 friendCount: 42
 *                 voicePinCount: 15
 *                 totalListens: 523
 *                 achievementCount: 8
 *                 discoveredVoicesCount: 3
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getUserStats = async (req, res) => {
    try {
        const idParam = req.params.id;
        const userId = idParam ? parseInt(idParam) : req.user.id;
        const [user, friendCount, voicePinCount, totalListens, achievementCount, discoveredCount] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId, deletedAt: null },
                select: { level: true, xp: true, scanRadius: true }
            }),
            prisma.friendship.count({
                where: {
                    OR: [
                        { senderId: userId, status: 'ACCEPTED' },
                        { receiverId: userId, status: 'ACCEPTED' }
                    ]
                }
            }),
            prisma.voicePin.count({ where: { userId, deletedAt: null } }),
            prisma.voicePin.aggregate({ where: { userId, deletedAt: null }, _sum: { listensCount: true } }),
            prisma.userAchievement.count({ where: { userId } }),
            prisma.discoveredVoice.count({ where: { userId } })
        ]);
        res.status(200).json({
            data: {
                // Gamification
                level: user?.level || 1,
                xp: user?.xp || 0,
                scanRadius: user?.scanRadius || 1000,
                // Social stats
                friendCount,
                voicePinCount,
                totalListens: totalListens._sum.listensCount || 0,
                // Achievement stats
                achievementCount,
                discoveredVoicesCount: discoveredCount
            }
        });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /user/me:
 *   put:
 *     summary: Update current user profile
 *     description: Updates the authenticated user's profile. Only provided fields will be updated.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 description: User display name
 *                 example: "John Doe"
 *               bio:
 *                 type: string
 *                 description: User biography (max 500 chars)
 *                 example: "Voice pin enthusiast 🎤"
 *     responses:
 *       200:
 *         description: Updated user profile with new avatar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "john_doe"
 *                     displayName:
 *                       type: string
 *                       example: "John Doe"
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *                       example: "https://res.cloudinary.com/xxx/avatar.jpg"
 *                     bio:
 *                       type: string
 *                       nullable: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const updateProfile = async (req, res) => {
    try {
        const { displayName, bio, isPublicAccount, searchable, liveLocation, sharingLevel, showActiveStatus, showTypingStatus } = req.body;
        const updateData = {};
        if (displayName !== undefined)
            updateData.displayName = displayName || null;
        if (bio !== undefined)
            updateData.bio = bio || null;
        if (isPublicAccount !== undefined)
            updateData.isPublicAccount = isPublicAccount;
        if (searchable !== undefined)
            updateData.searchable = searchable;
        if (liveLocation !== undefined)
            updateData.liveLocation = liveLocation;
        if (sharingLevel !== undefined)
            updateData.sharingLevel = sharingLevel;
        if (showActiveStatus !== undefined)
            updateData.showActiveStatus = showActiveStatus;
        if (showTypingStatus !== undefined)
            updateData.showTypingStatus = showTypingStatus;
        const updated = await prisma.user.update({
            where: { id: req.user.id, deletedAt: null },
            data: updateData,
            select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                cover: true,
                bio: true,
                level: true,
                updatedAt: true,
                isPublicAccount: true,
                searchable: true,
                liveLocation: true,
                sharingLevel: true,
                showActiveStatus: true,
                showTypingStatus: true
            }
        });
        res.status(200).json({ data: updated });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /user/me/avatar:
 *   put:
 *     summary: Update user avatar
 *     description: Uploads a new avatar image for the authenticated user. Image is stored on Cloudinary.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (JPG, PNG, etc.)
 *     responses:
 *       200:
 *         description: Updated user profile with new avatar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "john_doe"
 *                     displayName:
 *                       type: string
 *                       example: "John Doe"
 *                     avatar:
 *                       type: string
 *                       example: "https://res.cloudinary.com/xxx/avatars/new_avatar.jpg"
 *                     bio:
 *                       type: string
 *                       nullable: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Avatar file is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Avatar file is required"
 */
export const updateAvatar = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            res.status(400).json({ message: 'Avatar file is required' });
            return;
        }
        const avatarUrl = await uploadToAzure(req.file.buffer, req.file.originalname, req.file.mimetype, 'avatars');
        const updated = await prisma.user.update({
            where: { id: req.user.id, deletedAt: null },
            data: { avatar: avatarUrl },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                cover: true,
                bio: true,
                updatedAt: true
            }
        });
        res.status(200).json({ data: updated });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /user/me/cover:
 *   put:
 *     summary: Update user cover image
 *     description: Uploads a new cover (banner) image for the authenticated user. Image is stored on Azure.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cover
 *             properties:
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: Cover image file (JPG, PNG, etc.)
 *     responses:
 *       200:
 *         description: Updated user profile with new cover
 *       400:
 *         description: Cover file is required
 */
export const updateCover = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            res.status(400).json({ message: 'Cover file is required' });
            return;
        }
        const coverUrl = await uploadToAzure(req.file.buffer, req.file.originalname, req.file.mimetype, 'covers');
        const updated = await prisma.user.update({
            where: { id: req.user.id, deletedAt: null },
            data: { cover: coverUrl },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                cover: true,
                bio: true,
                updatedAt: true
            }
        });
        res.status(200).json({ data: updated });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /user/me:
 *   delete:
 *     summary: Deactivate account (soft delete)
 *     description: Deactivates the current user's account by setting deletedAt and changing status to DEACTIVATED. Account data is preserved but user can no longer access the app.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Account deactivated successfully (no content)
 *       400:
 *         description: Error deactivating account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const deactivateAccount = async (req, res) => {
    try {
        await prisma.user.update({
            where: { id: req.user.id, deletedAt: null },
            data: {
                deletedAt: new Date(),
                status: UserStatus.DEACTIVATED
            }
        });
        res.status(204).send();
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /user/me/fcm-token:
 *   put:
 *     summary: Update Firebase Cloud Messaging token
 *     description: Registers or updates the FCM token for the current user's device. Used for sending push notifications.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcmToken
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 example: "fcm_token_from_device"
 *     responses:
 *       200:
 *         description: FCM token updated successfully
 *       400:
 *         description: Error updating FCM token
 */
export const updateFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) {
            res.status(400).json({ message: 'fcmToken is required' });
            return;
        }
        await prisma.user.update({
            where: { id: req.user.id },
            data: { fcmToken }
        });
        res.status(200).json({ message: 'FCM token updated successfully' });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /user/me/achievements:
 *   get:
 *     summary: Get current user's achievements
 *     description: Returns all achievements earned by the authenticated user, sorted by most recent first.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user achievements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Achievement'
 *             example:
 *               data:
 *                 - userId: 1
 *                   achievementId: 5
 *                   earnedAt: "2024-01-10T15:30:00.000Z"
 *                   achievement:
 *                     id: 5
 *                     name: "Explorer Beginner"
 *                     description: "Discover your first hidden voice pin"
 *                     iconUrl: "https://res.cloudinary.com/xxx/explorer.png"
 *                     xpReward: 50
 *                 - userId: 1
 *                   achievementId: 1
 *                   earnedAt: "2024-01-05T10:00:00.000Z"
 *                   achievement:
 *                     id: 1
 *                     name: "First Voice"
 *                     description: "Create your first voice pin"
 *                     iconUrl: "https://res.cloudinary.com/xxx/first_voice.png"
 *                     xpReward: 25
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getMyAchievements = async (req, res) => {
    try {
        const achievements = await prisma.userAchievement.findMany({
            where: { userId: req.user.id },
            include: {
                achievement: true
            },
            orderBy: { earnedAt: 'desc' }
        });
        res.status(200).json({ data: achievements });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /user/me/discovered:
 *   get:
 *     summary: Get discovered hidden voices
 *     description: Returns all hidden voice pins that the authenticated user has discovered through AR exploration.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of discovered hidden voices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DiscoveredVoice'
 *             example:
 *               data:
 *                 - id: 1
 *                   discoveredAt: "2024-01-12T14:20:00.000Z"
 *                   userId: 1
 *                   voicePinId: 15
 *                   voicePin:
 *                     id: 15
 *                     audioUrl: "https://res.cloudinary.com/xxx/hidden_voice.mp3"
 *                     content: "A secret message!"
 *                     type: "HIDDEN_AR"
 *                     user:
 *                       id: 5
 *                       username: "secret_user"
 *                       displayName: "Mystery Person"
 *                       avatar: null
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getMyDiscoveredVoices = async (req, res) => {
    try {
        const discovered = await prisma.discoveredVoice.findMany({
            where: { userId: req.user.id },
            include: {
                voicePin: {
                    include: {
                        user: { select: { id: true, username: true, displayName: true, avatar: true } }
                    }
                }
            },
            orderBy: { discoveredAt: 'desc' }
        });
        res.status(200).json({ data: discovered });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /user/me/history:
 *   get:
 *     summary: Get voice view history
 *     description: Returns the authenticated user's recently viewed voice pins, sorted by most recent first.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Number of history items to return
 *         example: 20
 *     responses:
 *       200:
 *         description: List of recently viewed voices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ViewHistory'
 *             example:
 *               data:
 *                 - id: 100
 *                   viewedAt: "2024-01-15T10:00:00.000Z"
 *                   userId: 1
 *                   voicePinId: 10
 *                   voicePin:
 *                     id: 10
 *                     audioUrl: "https://res.cloudinary.com/xxx/voice.mp3"
 *                     content: "Check this out!"
 *                     listensCount: 45
 *                     user:
 *                       id: 3
 *                       username: "popular_user"
 *                       displayName: "Popular User"
 *                       avatar: "https://res.cloudinary.com/xxx/popular.jpg"
 *                     images: []
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getMyViewHistory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const history = await prisma.voiceViewHistory.findMany({
            where: { userId: req.user.id },
            include: {
                voicePin: {
                    include: {
                        user: { select: { id: true, username: true, displayName: true, avatar: true } },
                        images: true
                    }
                }
            },
            orderBy: { viewedAt: 'desc' },
            take: limit
        });
        res.status(200).json({ data: history });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /user/search:
 *   get:
 *     summary: Search users
 *     description: Search for users by username or display name. Only returns active, non-deleted users.
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (minimum 2 characters)
 *         example: "john"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: Maximum results to return
 *         example: 20
 *     responses:
 *       200:
 *         description: List of matching users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       displayName:
 *                         type: string
 *                         nullable: true
 *                       avatar:
 *                         type: string
 *                         nullable: true
 *                       level:
 *                         type: integer
 *             example:
 *               data:
 *                 - id: 1
 *                   username: "john_doe"
 *                   displayName: "John Doe"
 *                   avatar: "https://res.cloudinary.com/xxx/john.jpg"
 *                   level: 5
 *                 - id: 15
 *                   username: "johnny_b"
 *                   displayName: "Johnny"
 *                   avatar: null
 *                   level: 2
 *       400:
 *         description: Search query must be at least 2 characters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Search query must be at least 2 characters"
 */
export const searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        const limit = parseInt(req.query.limit) || 20;
        if (!query || query.length < 2) {
            res.status(400).json({ message: 'Search query must be at least 2 characters' });
            return;
        }
        const users = await prisma.user.findMany({
            where: {
                deletedAt: null,
                status: UserStatus.ACTIVE,
                OR: [
                    { username: { contains: query, mode: 'insensitive' } },
                    { displayName: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                level: true
            },
            take: limit
        });
        res.status(200).json({ data: users });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /user/me/password:
 *   put:
 *     summary: Change user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid old password or other error
 */
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user || !user.password) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const isMatch = await import('bcryptjs').then(bcrypt => bcrypt.default.compareSync(oldPassword, user.password));
        if (!isMatch) {
            res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });
            return;
        }
        const hashedPassword = await import('bcryptjs').then(bcrypt => bcrypt.default.hashSync(newPassword, 8));
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ message: error.message });
    }
};
//# sourceMappingURL=userController.js.map