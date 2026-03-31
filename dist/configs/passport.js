import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import prisma from '../prismaClient.js';
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'fallback-secret'
};
passport.use(new JwtStrategy(options, async (payload, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: payload.id }
        });
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    }
    catch (error) {
        return done(error, false);
    }
}));
export default passport;
//# sourceMappingURL=passport.js.map