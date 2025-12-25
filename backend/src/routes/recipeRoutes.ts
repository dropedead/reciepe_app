import { Router } from 'express';
import recipeController from '../controllers/recipeController';
import { authenticate } from '../middleware/auth';
import { tenantContext } from '../middleware/tenantMiddleware';

const router = Router();

// Apply authentication and tenant context middleware to all routes
router.use(authenticate, tenantContext);

router.get('/', recipeController.getAll.bind(recipeController));
router.get('/components', recipeController.getAvailableComponents.bind(recipeController)); // Must be before /:id
router.get('/:id', recipeController.getById.bind(recipeController));
router.post('/', recipeController.create.bind(recipeController));
router.put('/:id', recipeController.update.bind(recipeController));
router.delete('/:id', recipeController.remove.bind(recipeController));

export default router;
