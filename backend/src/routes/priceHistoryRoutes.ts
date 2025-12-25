import { Router } from 'express';
import priceHistoryController from '../controllers/priceHistoryController';
import { authenticate } from '../middleware/auth';
import { tenantContext } from '../middleware/tenantMiddleware';

const router = Router();

// Apply authentication and tenant context middleware to all routes
router.use(authenticate, tenantContext);

// Get all price history
router.get('/', priceHistoryController.getAll);

// Get summary report for all ingredients
router.get('/summary', priceHistoryController.getSummaryReport);

// Get price trends for comparison chart
router.get('/trends', priceHistoryController.getTrends);

// Get price history for specific ingredient
router.get('/ingredient/:ingredientId', priceHistoryController.getByIngredient);

// Get price statistics for specific ingredient
router.get('/ingredient/:ingredientId/stats', priceHistoryController.getStatistics);

// Create new price record
router.post('/', priceHistoryController.create);

// Delete price record
router.delete('/:id', priceHistoryController.delete);

export default router;
