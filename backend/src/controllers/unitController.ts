import { Request, Response } from 'express';
import { PURCHASE_UNITS, USAGE_UNITS, getDefaultConversionRate, getCompatibleUsageUnits, UNIT_GROUPS } from '../services/unitConversion';

class UnitController {
    // Get all purchase units
    getPurchaseUnits(req: Request, res: Response) {
        res.json(PURCHASE_UNITS);
    }

    // Get all usage units
    getUsageUnits(req: Request, res: Response) {
        res.json(USAGE_UNITS);
    }

    // Get unit groups with their base conversions
    getUnitGroups(req: Request, res: Response) {
        res.json(UNIT_GROUPS);
    }

    // Get compatible usage units for a purchase unit
    getCompatibleUnits(req: Request, res: Response) {
        const { purchaseUnit } = req.params;
        const compatibleUnits = getCompatibleUsageUnits(purchaseUnit);
        res.json(compatibleUnits);
    }

    // Calculate conversion rate
    calculateConversion(req: Request, res: Response) {
        const { purchaseUnit, usageUnit, packageSize } = req.query;

        if (!purchaseUnit || !usageUnit) {
            return res.status(400).json({ error: 'purchaseUnit and usageUnit are required' });
        }

        const conversionRate = getDefaultConversionRate(
            purchaseUnit as string,
            usageUnit as string,
            packageSize ? parseFloat(packageSize as string) : 1
        );

        res.json({
            purchaseUnit,
            usageUnit,
            packageSize: packageSize || 1,
            conversionRate,
            description: `1 ${purchaseUnit} = ${conversionRate} ${usageUnit}`
        });
    }
}

export default new UnitController();
