import { Router } from 'express';
import * as superAdminController from '../controllers/superAdminController';
import { authenticate } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/superAdminMiddleware';

const router = Router();

// All routes require authentication and super admin role
router.use(authenticate);
router.use(requireSuperAdmin);

// GET /api/superadmin/stats - Get dashboard statistics
router.get('/stats', superAdminController.getStats);

// GET /api/superadmin/users - Get all users with pagination
router.get('/users', superAdminController.getAllUsers);

export default router;
