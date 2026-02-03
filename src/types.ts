import { User } from '@prisma/client';
import { Request, Response, NextFunction, RequestHandler } from 'express';

declare global {
    namespace Express {
        interface User {
            id: number;
            username: string;
            email: string;
            password: string | null;
            googleId: string | null;
            displayName: string | null;
            avatar: string | null;
            bio: string | null;
            level: number;
            xp: number;
            scanRadius: number;
            status: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }
    }
}

export interface AuthenticatedRequest extends Request {
    user?: Express.User;
}

export interface JwtPayload {
    id: number;
    iat: number;
    exp: number;
}

// Helper type for async route handlers
export type AsyncHandler = (
    req: Request,
    res: Response,
    next?: NextFunction
) => Promise<void>;
