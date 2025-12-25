import { Router } from 'express';
import menuCategoryController from '../controllers/menuCategoryController';
import { authenticate } from '../middleware/auth';
import { tenantContext } from '../middleware/tenantMiddleware';

const router = Router();

// Apply authentication and tenant context middleware to all routes
router.use(authenticate, tenantContext);

router.get('/', menuCategoryController.getAll.bind(menuCategoryController));
router.get('/:id', menuCategoryController.getById.bind(menuCategoryController));
router.post('/', menuCategoryController.create.bind(menuCategoryController));
router.put('/:id', menuCategoryController.update.bind(menuCategoryController));
router.delete('/:id', menuCategoryController.remove.bind(menuCategoryController));

export default router;
