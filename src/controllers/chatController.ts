import { RequestHandler } from 'express';
import prisma from '../prismaClient.js';
import { socketService } from '../services/socketService.js';
import { createNotification } from './notificationController.js';

/**
 * @swagger
 * /chat/rooms:
 *   get:
 *     summary: Get all chat rooms for current user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
export const getChatRooms: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = req.user!.id;

        const rooms = await prisma.chatRoom.findMany({
            where: {
                members: { some: { userId } }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, username: true, displayName: true, avatar: true }
                        }
                    }
                },
                lastMessage: {
                    include: {
                        sender: {
                            select: { username: true }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.status(200).json({ data: rooms });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /chat/rooms/{roomId}/messages:
 *   get:
 *     summary: Get messages for a chat room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
export const getMessages: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = req.user!.id;
        const roomId = parseInt(req.params.roomId as string);
        const page = Math.max(1, Number(req.query.page) || 1);

        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        // Verify membership
        const membership = await prisma.chatMember.findUnique({
            where: { userId_roomId: { userId, roomId } }
        });

        if (!membership) {
            res.status(403).json({ message: 'Not a member of this chat room' });
            return;
        }

        const [messages, total] = await Promise.all([
            prisma.message.findMany({
                where: { roomId },
                include: {
                    sender: {
                        select: { id: true, username: true, displayName: true, avatar: true }
                    },
                    replyTo: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.message.count({ where: { roomId } })
        ]);

        res.status(200).json({
            data: messages.reverse(),
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /chat/private/{targetUserId}:
 *   post:
 *     summary: Get or create a private chat with a user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
export const getOrCreatePrivateChat: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = req.user!.id;
        const targetUserId = parseInt(req.params.targetUserId as string);


        if (userId === targetUserId) {
            res.status(400).json({ message: 'Cannot chat with yourself' });
            return;
        }

        // Find existing 1:1 chat room
        const existingRoom = await prisma.chatRoom.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { members: { some: { userId } } },
                    { members: { some: { userId: targetUserId } } }
                ]
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, username: true, displayName: true, avatar: true }
                        }
                    }
                }
            }
        });

        if (existingRoom) {
            res.status(200).json({ data: existingRoom });
            return;
        }

        // Create new room
        const newRoom = await prisma.chatRoom.create({
            data: {
                isGroup: false,
                members: {
                    create: [
                        { userId },
                        { userId: targetUserId }
                    ]
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, username: true, displayName: true, avatar: true }
                        }
                    }
                }
            }
        });

        res.status(201).json({ data: newRoom });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /chat/rooms/{roomId}/send:
 *   post:
 *     summary: Send a message to a chat room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
export const sendMessage: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = req.user!.id;
        const roomId = parseInt(req.params.roomId as string);
        const { content, type, fileUrl, fileSize, duration, replyToId } = req.body;


        // 1. Verify membership
        const room = await prisma.chatRoom.findUnique({
            where: { id: roomId },
            include: { members: { select: { userId: true } } }
        });

        if (!room || !room.members.some(m => m.userId === userId)) {
            res.status(403).json({ message: 'Not a member of this chat' });
            return;
        }

        // 2. Create message
        const message = await prisma.message.create({
            data: {
                content,
                type: type || 'TEXT',
                fileUrl,
                fileSize,
                duration,
                senderId: userId,
                roomId,
                replyToId
            },
            include: {
                sender: {
                    select: { id: true, username: true, displayName: true, avatar: true }
                }
            }
        });

        // 3. Update room's last message and updatedAt
        await prisma.chatRoom.update({
            where: { id: roomId },
            data: { 
                lastMessageId: message.id,
                updatedAt: new Date()
            }
        });

        // 4. Emit via Socket.io
        socketService.emitToRoom(roomId, 'new_message', message);

        // 5. Trigger Notifications for other members
        const otherMembers = room.members.filter(m => m.userId !== userId);
        const sender = await prisma.user.findUnique({ where: { id: userId }, select: { displayName: true, username: true, avatar: true } });

        for (const member of otherMembers) {
            createNotification(member.userId, 'NEW_MESSAGE', {
                senderId: userId,
                senderName: sender?.displayName || sender?.username,
                senderAvatar: sender?.avatar,
                content: type === 'TEXT' ? content : `Sent a ${type.toLowerCase()} message.`,
                roomId
            }).catch(() => {});
        }

        res.status(201).json({ data: message });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};
