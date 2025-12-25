import { Router } from 'express';
import unitMasterController from '../controllers/unitMasterController';
import { authenticate } from '../middleware/auth';
import { tenantContext } from '../middleware/tenantMiddleware';

const router = Router();

// Apply authentication and tenant context middleware to all routes
router.use(authenticate, tenantContext);

// Get all units
router.get('/', unitMasterController.getAll);

// Get units grouped by type
router.get('/grouped', unitMasterController.getAllGrouped);

// Get purchase units only
router.get('/purchase', unitMasterController.getPurchaseUnits);

// Get usage units only
router.get('/usage', unitMasterController.getUsageUnits);

// Get compatible usage units for a purchase unit
router.get('/compatible/:purchaseUnit', unitMasterController.getCompatibleUnits);

// Get conversion rate
router.get('/convert', unitMasterController.getConversionRate);

// Seed default units for organization
router.post('/seed', unitMasterController.seedDefaults);

// Get single unit by ID - must be after other specific routes
router.get('/:id', unitMasterController.getById);

// Create new unit
router.post('/', unitMasterController.create);

// Update unit
router.put('/:id', unitMasterController.update);

// Delete unit
router.delete('/:id', unitMasterController.delete);

export default router;
