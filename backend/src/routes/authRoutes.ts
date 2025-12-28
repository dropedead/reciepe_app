import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/google', authController.googleLogin); // Google OAuth
router.get('/verify/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, authController.changePassword);
router.put('/profile', authenticate, authController.updateProfile);

// Onboarding routes
router.get('/onboarding-status', authenticate, authController.getOnboardingStatus);
router.post('/setup-organization', authenticate, authController.setupOrganization);
router.post('/complete-onboarding', authenticate, authController.completeOnboarding);

export default router;
