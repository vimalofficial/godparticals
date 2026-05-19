import { Router } from 'express';
import { onboardController } from './controller';
// import { authMiddleware } from '../../middlewares/auth';

import { authMiddleware } from '../../../middlewares/auth';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/send-otp',      onboardController.sendOTP);
router.post('/verify-otp',    onboardController.verifyOTP);
router.post('/refresh-token', onboardController.refreshToken);

// ── Protected ─────────────────────────────────────────────────────────────────
// Note: complete-onboarding uses multipart/form-data
router.post('/complete-onboarding', authMiddleware, onboardController.completeOnboarding);
router.get('/profile',              authMiddleware, onboardController.getProfile);
router.post('/logout',              authMiddleware, onboardController.logout);

export default router;