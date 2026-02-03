import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithoutRequest } from 'passport-jwt';
import prisma from '../prismaClient.js';
import { JwtPayload } from '../types.js';

const options: StrategyOptionsWithoutRequest = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'fallback-secret'
};

passport.use(
    new JwtStrategy(options, async (payload: JwtPayload, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: payload.id }
            });

            if (user) {
                return done(null, user);
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

export default passport;
