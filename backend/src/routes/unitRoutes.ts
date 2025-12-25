import { Router } from 'express';
import unitController from '../controllers/unitController';

const router = Router();

// Get unit options
router.get('/purchase-units', unitController.getPurchaseUnits);
router.get('/usage-units', unitController.getUsageUnits);
router.get('/groups', unitController.getUnitGroups);

// Get compatible units for a purchase unit
router.get('/compatible/:purchaseUnit', unitController.getCompatibleUnits);

// Calculate conversion rate
router.get('/convert', unitController.calculateConversion);

export default router;
