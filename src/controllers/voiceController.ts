import { Request, Response, RequestHandler } from 'express';
import prisma from '../prismaClient.js';
import cloudinary from '../config/cloudinary.js';
import { Visibility, VoiceType } from '@prisma/client';

/**
 * @swagger
 * components:
 *   schemas:
 *     VoicePinImage:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         imageUrl:
 *           type: string
 *           example: "https://res.cloudinary.com/xxx/image.jpg"
 *         voicePinId:
 *           type: integer
 *           example: 5
 *     VoicePinReaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         type:
 *           type: string
 *           enum: [LIKE, LOVE, LAUGH, SAD, ANGRY]
 *           example: "LIKE"
 *         userId:
 *           type: integer
 *           example: 1
 *     VoicePinUser:
 *       type: object
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
 *     VoicePin:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         audioUrl:
 *           type: string
 *           description: URL to the audio file
 *           example: "https://res.cloudinary.com/xxx/voicepin/audio.mp3"
 *         content:
 *           type: string
 *           nullable: true
 *           description: Text caption/description
 *           example: "Check out this cool spot!"
 *         latitude:
 *           type: number
 *           format: float
 *           description: Latitude coordinate
 *           example: 37.7749
 *         longitude:
 *           type: number
 *           format: float
 *           description: Longitude coordinate
 *           example: -122.4194
 *         visibility:
 *           type: string
 *           enum: [PUBLIC, PRIVATE, FRIENDS]
 *           example: "PUBLIC"
 *         audioDuration:
 *           type: integer
 *           nullable: true
 *           description: Audio duration in seconds
 *           example: 30
 *         audioSize:
 *           type: integer
 *           nullable: true
 *           description: Audio file size in bytes
 *           example: 450000
 *         address:
 *           type: string
 *           nullable: true
 *           description: Human-readable location address
 *           example: "123 Main St, San Francisco, CA"
 *         isAnonymous:
 *           type: boolean
 *           description: Whether the voice pin is posted anonymously
 *           example: false
 *         type:
 *           type: string
 *           enum: [STANDARD, HIDDEN_AR]
 *           description: Voice type (standard or hidden AR mode)
 *           example: "STANDARD"
 *         unlockRadius:
 *           type: integer
 *           description: Unlock radius in meters for HIDDEN_AR type
 *           example: 0
 *         emotionLabel:
 *           type: string
 *           nullable: true
 *           description: AI-detected emotion label
 *           example: "Happy"
 *         emotionScore:
 *           type: number
 *           nullable: true
 *           description: AI emotion confidence score (0-1)
 *           example: 0.85
 *         stickerUrl:
 *           type: string
 *           nullable: true
 *           description: AI-generated sticker URL
 *           example: "https://res.cloudinary.com/xxx/stickers/happy.png"
 *         deviceModel:
 *           type: string
 *           nullable: true
 *           description: Device model used to create the voice pin
 *           example: "iPhone 14 Pro"
 *         osVersion:
 *           type: string
 *           nullable: true
 *           description: OS version
 *           example: "iOS 16.2"
 *         listensCount:
 *           type: integer
 *           description: Number of times the voice pin was listened to
 *           example: 42
 *         reactionsCount:
 *           type: integer
 *           description: Total number of reactions
 *           example: 15
 *         commentsCount:
 *           type: integer
 *           description: Total number of comments
 *           example: 7
 *         userId:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         user:
 *           $ref: '#/components/schemas/VoicePinUser'
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VoicePinImage'
 *     VoicePinWithReactions:
 *       allOf:
 *         - $ref: '#/components/schemas/VoicePin'
 *         - type: object
 *           properties:
 *             reactions:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VoicePinReaction'
 */

/**
 * @swagger
 * /voice:
 *   post:
 *     summary: Create a new voice pin
 *     description: Creates a new voice pin with audio file, location coordinates, and optional metadata. Supports standard and hidden AR modes.
 *     tags: [VoicePin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - latitude
 *               - longitude
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Audio file to upload
 *               description:
 *                 type: string
 *                 description: Caption/content for the voice pin
 *                 example: "Check out this cool spot!"
 *               latitude:
 *                 type: number
 *                 description: Latitude coordinate
 *                 example: 37.7749
 *               longitude:
 *                 type: number
 *                 description: Longitude coordinate
 *                 example: -122.4194
 *               visibility:
 *                 type: string
 *                 enum: [PUBLIC, PRIVATE, FRIENDS]
 *                 default: PUBLIC
 *               images:
 *                 type: string
 *                 description: JSON array of image URLs
 *                 example: '["https://example.com/img1.jpg"]'
 *               audioDuration:
 *                 type: integer
 *                 description: Duration in seconds
 *                 example: 30
 *               audioSize:
 *                 type: integer
 *                 description: Size in bytes
 *                 example: 450000
 *               address:
 *                 type: string
 *                 description: Location address string
 *                 example: "123 Main St, San Francisco, CA"
 *               isAnonymous:
 *                 type: boolean
 *                 default: false
 *                 description: Post anonymously
 *               type:
 *                 type: string
 *                 enum: [STANDARD, HIDDEN_AR]
 *                 default: STANDARD
 *                 description: Voice type (standard or AR hidden)
 *               unlockRadius:
 *                 type: integer
 *                 default: 0
 *                 description: Unlock radius in meters for HIDDEN_AR type
 *               emotionLabel:
 *                 type: string
 *                 description: Detected emotion label (e.g. Happy, Sad)
 *               emotionScore:
 *                 type: number
 *                 description: Emotion confidence score (0-1)
 *               stickerUrl:
 *                 type: string
 *                 description: AI-generated sticker URL
 *               deviceModel:
 *                 type: string
 *                 description: Device model (e.g. iPhone 14 Pro)
 *               osVersion:
 *                 type: string
 *                 description: OS version (e.g. iOS 16.2)
 *     responses:
 *       200:
 *         description: Voice pin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/VoicePin'
 *             example:
 *               data:
 *                 id: 1
 *                 audioUrl: "https://res.cloudinary.com/xxx/voicepin/audio.mp3"
 *                 content: "Check out this cool spot!"
 *                 latitude: 37.7749
 *                 longitude: -122.4194
 *                 visibility: "PUBLIC"
 *                 audioDuration: 30
 *                 audioSize: 450000
 *                 address: "123 Main St, San Francisco, CA"
 *                 isAnonymous: false
 *                 type: "STANDARD"
 *                 unlockRadius: 0
 *                 emotionLabel: "Happy"
 *                 emotionScore: 0.85
 *                 stickerUrl: null
 *                 deviceModel: "iPhone 14 Pro"
 *                 osVersion: "iOS 16.2"
 *                 listensCount: 0
 *                 reactionsCount: 0
 *                 commentsCount: 0
 *                 userId: 1
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *                 images: []
 *       400:
 *         description: Bad request - missing audio file or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Audio file is required"
 */
export const createVoicePin: RequestHandler = async (req, res): Promise<void> => {
    try {
        const fileBuffer = req.file?.buffer;
        const userId = req.user!.id;
        const {
            description,
            latitude,
            longitude,
            visibility,
            images,
            // New fields
            audioDuration,
            audioSize,
            address,
            isAnonymous,
            type,
            unlockRadius,
            emotionLabel,
            emotionScore,
            stickerUrl,
            deviceModel,
            osVersion
        } = req.body;

        if (!fileBuffer) {
            res.status(400).json({ message: 'Audio file is required' });
            return;
        }

        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'auto', folder: 'voicepin' },
                (error, result) => {
                    if (result) resolve(result as { secure_url: string });
                    else reject(error);
                }
            );
            uploadStream.end(fileBuffer);
        });

        const voicePin = await prisma.voicePin.create({
            data: {
                audioUrl: result.secure_url,
                content: description || null,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                visibility: visibility || Visibility.PUBLIC,
                userId,
                // Audio metadata
                audioDuration: audioDuration ? parseInt(audioDuration) : null,
                audioSize: audioSize ? parseInt(audioSize) : null,
                // Location
                address: address || null,
                // Privacy & Mode
                isAnonymous: isAnonymous === 'true' || isAnonymous === true,
                type: type || VoiceType.STANDARD,
                unlockRadius: unlockRadius ? parseInt(unlockRadius) : 0,
                // AI & Emotion data
                emotionLabel: emotionLabel || null,
                emotionScore: emotionScore ? parseFloat(emotionScore) : null,
                stickerUrl: stickerUrl || null,
                // Device metadata
                deviceModel: deviceModel || null,
                osVersion: osVersion || null,
                // Images relation
                images: {
                    create: JSON.parse(images || '[]').map((url: string) => ({ imageUrl: url }))
                }
            },
            include: { images: true }
        });

        res.status(200).json({ data: voicePin });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /voice/{id}:
 *   put:
 *     summary: Update a voice pin
 *     description: Updates an existing voice pin. Only the owner can update. Only provided fields will be changed.
 *     tags: [VoicePin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Voice pin ID
 *         example: 1
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: New audio file (optional)
 *               description:
 *                 type: string
 *                 description: Caption/content for the voice pin
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               visibility:
 *                 type: string
 *                 enum: [PUBLIC, PRIVATE, FRIENDS]
 *               images:
 *                 type: string
 *                 description: JSON array of image URLs (replaces existing)
 *               audioDuration:
 *                 type: integer
 *               audioSize:
 *                 type: integer
 *               address:
 *                 type: string
 *               isAnonymous:
 *                 type: boolean
 *               type:
 *                 type: string
 *                 enum: [STANDARD, HIDDEN_AR]
 *               unlockRadius:
 *                 type: integer
 *               emotionLabel:
 *                 type: string
 *               emotionScore:
 *                 type: number
 *               stickerUrl:
 *                 type: string
 *               deviceModel:
 *                 type: string
 *               osVersion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Voice pin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/VoicePin'
 *             example:
 *               data:
 *                 id: 1
 *                 audioUrl: "https://res.cloudinary.com/xxx/voicepin/audio.mp3"
 *                 content: "Updated description"
 *                 latitude: 37.7749
 *                 longitude: -122.4194
 *                 visibility: "FRIENDS"
 *                 audioDuration: 30
 *                 audioSize: 450000
 *                 address: "456 Oak Ave, San Francisco, CA"
 *                 isAnonymous: false
 *                 type: "STANDARD"
 *                 unlockRadius: 0
 *                 emotionLabel: "Happy"
 *                 emotionScore: 0.85
 *                 stickerUrl: null
 *                 deviceModel: "iPhone 14 Pro"
 *                 osVersion: "iOS 16.2"
 *                 listensCount: 42
 *                 reactionsCount: 15
 *                 commentsCount: 7
 *                 userId: 1
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-16T08:00:00.000Z"
 *                 images: []
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Voice pin not found or deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Voice pin not found"
 */
export const updateVoicePin: RequestHandler = async (req, res): Promise<void> => {
    try {
        const id = req.params.id as string;
        const fileBuffer = req.file?.buffer;
        const userId = req.user!.id;
        const {
            description,
            latitude,
            longitude,
            visibility,
            images,
            // New fields
            audioDuration,
            audioSize,
            address,
            isAnonymous,
            type,
            unlockRadius,
            emotionLabel,
            emotionScore,
            stickerUrl,
            deviceModel,
            osVersion
        } = req.body;

        let audioUrl: string | undefined;
        if (fileBuffer) {
            const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'video', folder: 'voicepin' },
                    (error, result) => {
                        if (result) resolve(result as { secure_url: string });
                        else reject(error);
                    }
                );
                stream.end(fileBuffer);
            });
            audioUrl = result.secure_url;
        }

        // Build update data object with only provided fields
        const updateData: Record<string, unknown> = {};

        if (audioUrl) updateData.audioUrl = audioUrl;
        if (description !== undefined) updateData.content = description || null;
        if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
        if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
        if (visibility !== undefined) updateData.visibility = visibility;
        if (audioDuration !== undefined) updateData.audioDuration = parseInt(audioDuration);
        if (audioSize !== undefined) updateData.audioSize = parseInt(audioSize);
        if (address !== undefined) updateData.address = address || null;
        if (isAnonymous !== undefined) updateData.isAnonymous = isAnonymous === 'true' || isAnonymous === true;
        if (type !== undefined) updateData.type = type;
        if (unlockRadius !== undefined) updateData.unlockRadius = parseInt(unlockRadius);
        if (emotionLabel !== undefined) updateData.emotionLabel = emotionLabel || null;
        if (emotionScore !== undefined) updateData.emotionScore = parseFloat(emotionScore);
        if (stickerUrl !== undefined) updateData.stickerUrl = stickerUrl || null;
        if (deviceModel !== undefined) updateData.deviceModel = deviceModel || null;
        if (osVersion !== undefined) updateData.osVersion = osVersion || null;

        // Handle images if provided
        if (images) {
            updateData.images = {
                deleteMany: {},
                create: JSON.parse(images).map((url: string) => ({ imageUrl: url }))
            };
        }

        const voicePin = await prisma.voicePin.update({
            where: { id: parseInt(id), userId, deletedAt: null },
            data: updateData,
            include: { images: true }
        });

        res.status(200).json({ data: voicePin });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /voice/public:
 *   get:
 *     summary: Get all public voice pins
 *     description: Returns all public voice pins from all users, sorted by newest first. Excludes deleted voice pins.
 *     tags: [VoicePin]
 *     responses:
 *       200:
 *         description: List of public voice pins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VoicePin'
 *             example:
 *               data:
 *                 - id: 5
 *                   audioUrl: "https://res.cloudinary.com/xxx/audio5.mp3"
 *                   content: "Beautiful sunset here!"
 *                   latitude: 34.0522
 *                   longitude: -118.2437
 *                   visibility: "PUBLIC"
 *                   audioDuration: 15
 *                   audioSize: 225000
 *                   address: "Los Angeles, CA"
 *                   isAnonymous: false
 *                   type: "STANDARD"
 *                   unlockRadius: 0
 *                   emotionLabel: "Joy"
 *                   emotionScore: 0.92
 *                   listensCount: 128
 *                   reactionsCount: 45
 *                   commentsCount: 12
 *                   userId: 3
 *                   createdAt: "2024-01-14T18:30:00.000Z"
 *                   user:
 *                     id: 3
 *                     username: "sunset_lover"
 *                     displayName: "Sarah"
 *                     avatar: "https://res.cloudinary.com/xxx/sarah.jpg"
 *                   images:
 *                     - id: 1
 *                       imageUrl: "https://res.cloudinary.com/xxx/sunset.jpg"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getPublicVoicePin: RequestHandler = async (_req, res): Promise<void> => {
    try {
        const voicePins = await prisma.voicePin.findMany({
            where: { visibility: 'PUBLIC', deletedAt: null },
            include: {
                user: { select: { id: true, username: true, avatar: true, displayName: true } },
                images: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ data: voicePins });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /voice/user/{id}/public:
 *   get:
 *     summary: Get public voice pins by user
 *     description: Returns all public voice pins created by a specific user.
 *     tags: [VoicePin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 3
 *     responses:
 *       200:
 *         description: User's public voice pins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VoicePin'
 *             example:
 *               data:
 *                 - id: 5
 *                   audioUrl: "https://res.cloudinary.com/xxx/audio5.mp3"
 *                   content: "Beautiful sunset here!"
 *                   latitude: 34.0522
 *                   longitude: -118.2437
 *                   visibility: "PUBLIC"
 *                   listensCount: 128
 *                   userId: 3
 *                   createdAt: "2024-01-14T18:30:00.000Z"
 *                   user:
 *                     id: 3
 *                     username: "sunset_lover"
 *                     displayName: "Sarah"
 *                     avatar: "https://res.cloudinary.com/xxx/sarah.jpg"
 *                   images: []
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getPublicVoicePinByUser: RequestHandler = async (req, res): Promise<void> => {
    try {
        const id = req.params.id as string;
        const voicePins = await prisma.voicePin.findMany({
            where: { visibility: 'PUBLIC', userId: parseInt(id), deletedAt: null },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatar: true } },
                images: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ data: voicePins });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /voice/me/public:
 *   get:
 *     summary: Get my public voice pins
 *     description: Returns all public voice pins created by the authenticated user.
 *     tags: [VoicePin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My public voice pins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VoicePin'
 *             example:
 *               data:
 *                 - id: 1
 *                   audioUrl: "https://res.cloudinary.com/xxx/my_audio.mp3"
 *                   content: "My first voice pin!"
 *                   latitude: 37.7749
 *                   longitude: -122.4194
 *                   visibility: "PUBLIC"
 *                   listensCount: 10
 *                   userId: 1
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                   user:
 *                     id: 1
 *                     username: "john_doe"
 *                     displayName: "John Doe"
 *                     avatar: "https://res.cloudinary.com/xxx/john.jpg"
 *                   images: []
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getMyPublicVoicePins: RequestHandler = async (req, res): Promise<void> => {
    try {
        const voicePins = await prisma.voicePin.findMany({
            where: { visibility: 'PUBLIC', userId: req.user!.id, deletedAt: null },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatar: true } },
                images: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ data: voicePins });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /voice/friends:
 *   get:
 *     summary: Get friends' visible voice pins
 *     description: Returns voice pins from friends that are visible to the authenticated user (PUBLIC or FRIENDS visibility).
 *     tags: [VoicePin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Friends' voice pins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VoicePin'
 *             example:
 *               data:
 *                 - id: 10
 *                   audioUrl: "https://res.cloudinary.com/xxx/friend_audio.mp3"
 *                   content: "Friends only post!"
 *                   latitude: 40.7128
 *                   longitude: -74.0060
 *                   visibility: "FRIENDS"
 *                   listensCount: 5
 *                   userId: 2
 *                   createdAt: "2024-01-16T14:00:00.000Z"
 *                   user:
 *                     id: 2
 *                     username: "jane_smith"
 *                     displayName: "Jane"
 *                     avatar: null
 *                   images: []
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getFriendsVisibleVoicePins: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = req.user!.id;

        const friendships = await prisma.friendship.findMany({
            where: {
                status: 'ACCEPTED',
                OR: [{ senderId: userId }, { receiverId: userId }]
            },
            select: { senderId: true, receiverId: true }
        });

        const friendIds = friendships.map(f => (f.senderId === userId ? f.receiverId : f.senderId));
        if (friendIds.length === 0) {
            res.status(200).json({ data: [] });
            return;
        }

        const voicePins = await prisma.voicePin.findMany({
            where: { visibility: { in: ['PUBLIC', 'FRIENDS'] }, userId: { in: friendIds }, deletedAt: null },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatar: true } },
                images: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ data: voicePins });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /voice/{id}:
 *   get:
 *     summary: Get a specific voice pin
 *     description: Retrieves a single voice pin by ID. Automatically increments the listen count. Includes user info, images, and reactions.
 *     tags: [VoicePin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Voice pin ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Voice pin details with reactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/VoicePinWithReactions'
 *             example:
 *               data:
 *                 id: 1
 *                 audioUrl: "https://res.cloudinary.com/xxx/audio.mp3"
 *                 content: "Check out this cool spot!"
 *                 latitude: 37.7749
 *                 longitude: -122.4194
 *                 visibility: "PUBLIC"
 *                 audioDuration: 30
 *                 audioSize: 450000
 *                 address: "123 Main St, San Francisco, CA"
 *                 isAnonymous: false
 *                 type: "STANDARD"
 *                 unlockRadius: 0
 *                 emotionLabel: "Happy"
 *                 emotionScore: 0.85
 *                 listensCount: 43
 *                 reactionsCount: 15
 *                 commentsCount: 7
 *                 userId: 1
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 user:
 *                   id: 1
 *                   username: "john_doe"
 *                   displayName: "John Doe"
 *                   avatar: "https://res.cloudinary.com/xxx/john.jpg"
 *                 images:
 *                   - id: 1
 *                     imageUrl: "https://res.cloudinary.com/xxx/image.jpg"
 *                 reactions:
 *                   - id: 1
 *                     type: "LIKE"
 *                     userId: 2
 *                   - id: 2
 *                     type: "LOVE"
 *                     userId: 3
 *       404:
 *         description: Voice pin not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Voice Pin not found"
 */
export const getRetrieveVoicePin: RequestHandler = async (req, res): Promise<void> => {
    try {
        const id = req.params.id as string;

        const voicePin = await prisma.voicePin.update({
            where: { id: parseInt(id), deletedAt: null },
            data: { listensCount: { increment: 1 } },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatar: true } },
                images: true,
                reactions: { select: { id: true, type: true, userId: true } }
            }
        });

        if (!voicePin) {
            res.status(404).json({ message: 'Voice Pin not found' });
            return;
        }

        res.status(200).json({ data: voicePin });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /voice:
 *   get:
 *     summary: Get all voice pins for logged-in user
 *     description: Returns all voice pins (public, private, friends) created by the authenticated user.
 *     tags: [VoicePin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's voice pins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VoicePin'
 *             example:
 *               data:
 *                 - id: 1
 *                   audioUrl: "https://res.cloudinary.com/xxx/audio1.mp3"
 *                   content: "Public voice pin"
 *                   visibility: "PUBLIC"
 *                   listensCount: 50
 *                   userId: 1
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                   images: []
 *                 - id: 2
 *                   audioUrl: "https://res.cloudinary.com/xxx/audio2.mp3"
 *                   content: "Private note to self"
 *                   visibility: "PRIVATE"
 *                   listensCount: 3
 *                   userId: 1
 *                   createdAt: "2024-01-14T08:00:00.000Z"
 *                   images: []
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getVoicePin: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = req.user!.id;

        const voicePins = await prisma.voicePin.findMany({
            where: { userId, deletedAt: null },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatar: true } },
                images: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ data: voicePins });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /voice/{id}:
 *   delete:
 *     summary: Delete a voice pin (soft delete)
 *     description: Soft deletes a voice pin by setting deletedAt timestamp. Only the owner can delete. The voice pin data is preserved but will not appear in queries.
 *     tags: [VoicePin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Voice pin ID to delete
 *         example: 1
 *     responses:
 *       204:
 *         description: Voice pin deleted successfully (no content)
 *       400:
 *         description: Bad request or voice pin not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const deleteVoicePin: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = req.user!.id;
        const id = req.params.id as string;

        // Soft delete by setting deletedAt timestamp
        await prisma.voicePin.update({
            where: { id: parseInt(id), userId, deletedAt: null },
            data: { deletedAt: new Date() }
        });

        res.status(204).send();
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /voice/{id}/comment:
 *   get:
 *     summary: Get comments for a voice pin
 *     description: Returns all comments for a specific voice pin, including nested replies. Sorted by newest first.
 *     tags: [VoicePin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Voice pin ID
 *         example: 1
 *     responses:
 *       200:
 *         description: List of comments with replies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CommentWithReplies'
 *             example:
 *               data:
 *                 - id: 1
 *                   content: "Great voice pin!"
 *                   audioUrl: null
 *                   voicePinId: 1
 *                   userId: 2
 *                   parentId: null
 *                   createdAt: "2024-01-15T11:00:00.000Z"
 *                   user:
 *                     id: 2
 *                     username: "jane_smith"
 *                     displayName: "Jane"
 *                     avatar: null
 *                   replies:
 *                     - id: 3
 *                       content: "I agree!"
 *                       audioUrl: null
 *                       voicePinId: 1
 *                       userId: 3
 *                       parentId: 1
 *                       createdAt: "2024-01-15T11:30:00.000Z"
 *                       user:
 *                         id: 3
 *                         username: "bob"
 *                         displayName: "Bob"
 *                         avatar: null
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getComment: RequestHandler = async (req, res): Promise<void> => {
    try {
        const id = req.params.id as string;

        const comments = await prisma.comment.findMany({
            where: { voicePinId: parseInt(id), deletedAt: null },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatar: true } },
                replies: {
                    where: { deletedAt: null },
                    include: {
                        user: { select: { id: true, username: true, displayName: true, avatar: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ data: comments });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};
