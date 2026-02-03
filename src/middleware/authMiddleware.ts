import { Response, NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import { AuthenticatedRequest } from '../types.js';

export const authenticate: RequestHandler = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err: Error | null, user: Express.User | false) => {
        if (err) {
            res.status(500).json({ message: 'Authentication error' });
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
