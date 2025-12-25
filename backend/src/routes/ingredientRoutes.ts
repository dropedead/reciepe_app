import { Router } from 'express';
import ingredientController from '../controllers/ingredientController';
import { authenticate } from '../middleware/auth';
import { tenantContext } from '../middleware/tenantMiddleware';

const router = Router();

// Apply authentication and tenant context middleware to all routes
router.use(authenticate, tenantContext);

router.get('/', ingredientController.getAll.bind(ingredientController));
router.get('/:id', ingredientController.getById.bind(ingredientController));
router.post('/', ingredientController.create.bind(ingredientController));
router.put('/:id', ingredientController.update.bind(ingredientController));
router.delete('/:id', ingredientController.remove.bind(ingredientController));

export default router;
