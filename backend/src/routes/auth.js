import express from 'express';
import passport from 'passport';
const router = express.Router();
// Protected route to test SSI login with Verifiable Presentation
router.post('/login', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        message: 'Logged in successfully',
        user: req.user, // This will be the verifiable presentation
    });
});
export default router;
