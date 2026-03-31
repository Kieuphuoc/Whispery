import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
class SocketService {
    io = null;
    userSockets = new Map(); // userId -> socketIds[]
    init(httpServer) {
        this.io = new Server(httpServer, {
            path: '/socket.io/',
            addTrailingSlash: false,
            cors: {
                origin: '*', // Adjust for production
                methods: ['GET', 'POST'],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });
        console.log('[Socket BE] Socket.io server initialized at path: /socket.io/');
        // Authentication Middleware
        this.io.use((socket, next) => {
            console.log(`[Socket BE] Middleware checking auth for connection id: ${socket.id}`);
            const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
            if (!token) {
                console.error(`[Socket BE] Auth Error for ${socket.id}: No token provided`);
                return next(new Error('Authentication error: No token provided'));
            }
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.id;
                console.log(`[Socket BE] Auth Success for user: ${decoded.id} (socket: ${socket.id})`);
                next();
            }
            catch (err) {
                console.error(`[Socket BE] Auth Error: Invalid token for ${socket.id}`, err.message);
                return next(new Error('Authentication error: Invalid token'));
            }
        });
        this.io.on('connection', (socket) => {
            const userId = socket.userId;
            console.log(`[Socket BE] User Connected -> UserId: ${userId} | SocketId: ${socket.id}`);
            // Register user socket
            const sockets = this.userSockets.get(userId) || [];
            this.userSockets.set(userId, [...sockets, socket.id]);
            // Join personal room for private notifications
            socket.join(`user_${userId}`);
            socket.on('join_room', (roomId) => {
                socket.join(`room_${roomId}`);
                console.log(`[Socket BE] Client Request: User ${userId} joined room_${roomId}`);
            });
            socket.on('leave_room', (roomId) => {
                socket.leave(`room_${roomId}`);
                console.log(`[Socket BE] Client Request: User ${userId} left room_${roomId}`);
            });
            socket.on('error', (err) => {
                console.error(`[Socket BE] Socket Error for User ${userId} (${socket.id}):`, err);
            });
            socket.on('disconnect', (reason) => {
                const sockets = this.userSockets.get(userId) || [];
                const updatedSockets = sockets.filter(id => id !== socket.id);
                if (updatedSockets.length > 0) {
                    this.userSockets.set(userId, updatedSockets);
                }
                else {
                    this.userSockets.delete(userId);
                }
                console.log(`[Socket BE] User Disconnected -> UserId: ${userId} | SocketId: ${socket.id} | Reason: ${reason}`);
            });
        });
    }
    getIO() {
        if (!this.io) {
            throw new Error('Socket.io not initialized');
        }
        return this.io;
    }
    // Helper to send message to a specific user across all their devices
    emitToUser(userId, event, data) {
        console.log(`[Socket BE] Emitting to User: ${userId} | Event: '${event}' | Data:`, JSON.stringify(data).substring(0, 100) + '...');
        this.io?.to(`user_${userId}`).emit(event, data);
    }
    // Helper to send message to a room
    emitToRoom(roomId, event, data) {
        console.log(`[Socket BE] Emitting to Room: ${roomId} | Event: '${event}' | Data:`, JSON.stringify(data).substring(0, 100) + '...');
        this.io?.to(`room_${roomId}`).emit(event, data);
    }
}
export const socketService = new SocketService();
//# sourceMappingURL=socketService.js.map