import { Router } from 'express';
import categoryController from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';
import { tenantContext } from '../middleware/tenantMiddleware';

const router = Router();

// Apply authentication and tenant context middleware to all routes
router.use(authenticate, tenantContext);

router.get('/', categoryController.getAll.bind(categoryController));
router.get('/:id', categoryController.getById.bind(categoryController));
router.post('/', categoryController.create.bind(categoryController));
router.put('/:id', categoryController.update.bind(categoryController));
router.delete('/:id', categoryController.remove.bind(categoryController));

export default router;
