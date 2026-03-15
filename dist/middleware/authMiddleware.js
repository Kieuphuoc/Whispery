import passport from 'passport';
export const authenticate = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
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
// Optional authentication - sets user if valid token, continues without user otherwise
export const optionalAuthenticate = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err) {
            return next();
        }
        if (user) {
            req.user = user;
        }
        next();
    })(req, res, next);
};
//# sourceMappingURL=authMiddleware.js.map