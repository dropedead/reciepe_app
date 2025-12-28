import { Router } from 'express';
import bundlingController from '../controllers/bundlingController';
import { authenticate } from '../middleware/auth';
import { tenantContext } from '../middleware/tenantMiddleware';

const router = Router();

// Apply authentication and tenant context middleware to all routes
router.use(authenticate, tenantContext);

// CRUD routes
router.get('/', bundlingController.getAll.bind(bundlingController));
router.get('/:id', bundlingController.getById.bind(bundlingController));
router.post('/', bundlingController.create.bind(bundlingController));
router.put('/:id', bundlingController.update.bind(bundlingController));
router.delete('/:id', bundlingController.remove.bind(bundlingController));

// Calculate endpoint (for preview without saving)
router.post('/calculate', bundlingController.calculate.bind(bundlingController));

export default router;
