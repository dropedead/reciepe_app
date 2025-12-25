import { Router } from 'express';
import menuController from '../controllers/menuController';
import { authenticate } from '../middleware/auth';
import { tenantContext } from '../middleware/tenantMiddleware';

const router = Router();

// Apply authentication and tenant context middleware to all routes
router.use(authenticate, tenantContext);

router.get('/', menuController.getAll.bind(menuController));
router.get('/:id', menuController.getById.bind(menuController));
router.post('/', menuController.create.bind(menuController));
router.put('/:id', menuController.update.bind(menuController));
router.delete('/:id', menuController.remove.bind(menuController));

export default router;
