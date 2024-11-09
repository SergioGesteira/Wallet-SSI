// config/passportConfig.js
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
};

passport.use(
    'VerifiablePresentation',
    new JwtStrategy(opts, async (jwtPayload, done) => {
        console.log('jwtPayload:', jwtPayload);
        return done(null, jwtPayload);
    })
);

export default passport;
