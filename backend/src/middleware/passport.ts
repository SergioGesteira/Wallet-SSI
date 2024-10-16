// import passport from 'passport';
// import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
// import { veramoAgent } from '../frontend/vite-project/src/agent';

// passport.use(
//     new JWTStrategy(
//       {
//         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//         secretOrKey: process.env.JWT_SECRET,
//       },
//       async (jwtPayload, done) => {
//         try {
//           // Use the agent to resolve the DID and verify the JWT
//           const didDocument = await veramoAgent.resolveDid({ didUrl: jwtPayload.sub });
//           if (didDocument) {
//             return done(null, didDocument);
//           } else {
//             return done(null, false);
//           }
//         } catch (error) {
//           return done(error, false);
//         }
//       }
//     )
//   );
  
//   export default passport;