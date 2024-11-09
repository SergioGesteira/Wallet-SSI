// routes/authRoutes.js
import express from 'express';
import * as authController from '../controllers/authController.js';
const router = express.Router();

router.get('/getNonce', authController.getNonce);
router.post('/verifyPresentation', authController.verifyPresentation);
router.get('/redirectToCredentialApp', (req, res) => {
    res.redirect('http://localhost:5173'); // Redirect to the credential creation app
});
export default router;
