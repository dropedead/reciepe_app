import { Router } from 'express';
import statsController from '../controllers/statsController';
import { authenticate } from '../middleware/auth';
import { tenantContext } from '../middleware/tenantMiddleware';

const router = Router();

// Apply authentication and tenant context middleware
router.use(authenticate, tenantContext);

router.get('/', statsController.getStats.bind(statsController));

export default router;
