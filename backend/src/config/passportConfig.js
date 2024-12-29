// // config/passportConfig.js

// // Import Passport.js and JWT Strategy for handling JWT-based authentication
// import passport from 'passport';
// import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
// import dotenv from 'dotenv';

// dotenv.config();
// const jwtSecret = process.env.JWT_SECRET;

// // Options for the JWT strategy, specifying how to extract the token and the secret key to verify it
// const opts = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from Authorization header as a Bearer token
//     secretOrKey: jwtSecret, 
// };

// // Set up the JWT strategy for Passport under the "VerifiablePresentation" strategy name
// passport.use(
//     'VerifiablePresentation',
//     new JwtStrategy(opts, async (jwtPayload, done) => {
//         console.log('jwtPayload:', jwtPayload); 
//         return done(null, jwtPayload); 
//     })
// );


// export default passport;
