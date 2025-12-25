import { Router } from 'express';
import recipeCategoryController from '../controllers/recipeCategoryController';
import { authenticate } from '../middleware/auth';
import { tenantContext } from '../middleware/tenantMiddleware';

const router = Router();

// Apply authentication and tenant context middleware to all routes
router.use(authenticate, tenantContext);

router.get('/', recipeCategoryController.getAll.bind(recipeCategoryController));
router.get('/:id', recipeCategoryController.getById.bind(recipeCategoryController));
router.post('/', recipeCategoryController.create.bind(recipeCategoryController));
router.put('/:id', recipeCategoryController.update.bind(recipeCategoryController));
router.delete('/:id', recipeCategoryController.remove.bind(recipeCategoryController));

export default router;
