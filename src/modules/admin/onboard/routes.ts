import { Router } from 'express';
import { adminOnboardController } from './controller';
import { authMiddleware } from '../../../middlewares/auth';
import { adminRoleMiddleware } from '../../../middlewares/adminRole';






const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/sign-in',       adminOnboardController.signIn);
// router.post('/refresh-token', adminOnboardController.refreshToken);

// ── Protected (admin role required) ──────────────────────────────────────────
// router.post('/add-admin', authMiddleware, adminRoleMiddleware, adminOnboardController.addAdmin);
router.post('/add-admin', adminOnboardController.addAdmin);
router.get('/profile',    authMiddleware, adminRoleMiddleware, adminOnboardController.getProfile);
router.post('/logout',    authMiddleware, adminRoleMiddleware, adminOnboardController.logout);

export default router;