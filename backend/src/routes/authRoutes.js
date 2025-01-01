// routes/authRoutes.js
import express from 'express';
import * as authController from '../controllers/authController.js';


const router = express.Router();


router.get('/getNonce', authController.getNonce);
router.post('/verifyPresentation', authController.verifyPresentation);

export default router;
