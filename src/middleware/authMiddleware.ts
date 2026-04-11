import { Response, NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import { AuthenticatedRequest } from '../types.js';

export const authenticate: RequestHandler = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err: Error | null, user: Express.User | false) => {
        if (err) {
            console.error('Authentication Error:', err);
            res.status(500).json({ message: 'Authentication error', error: err.message });
            return;
        }

        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        req.user = user;
        next();
    })(req, res, next);
};

// Optional authentication - sets user if valid token, continues without user otherwise
export const optionalAuthenticate: RequestHandler = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err: Error | null, user: Express.User | false) => {
        if (err) {
            return next();
        }
        if (user) {
            req.user = user;
        }
        next();
    })(req, res, next);
};

export const authorize = (allowedRoles: string[]): RequestHandler => {
    return (req, res, next) => {
        const user = (req as AuthenticatedRequest).user;

        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            return;
        }

        next();
    };
};
