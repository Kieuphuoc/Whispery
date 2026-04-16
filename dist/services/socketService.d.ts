import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
declare class SocketService {
    private io;
    private userSockets;
    init(httpServer: HttpServer): void;
    getIO(): Server;
    emitToUser(userId: number, event: string, data: any): void;
    emitToRoom(roomId: number, event: string, data: any): void;
}
export declare const socketService: SocketService;
export {};
//# sourceMappingURL=socketService.d.ts.map