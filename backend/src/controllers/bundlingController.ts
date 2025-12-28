import { Request, Response, NextFunction } from 'express';
import bundlingService from '../services/bundlingService';

class BundlingController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.organizationId) {
                res.status(400).json({ error: 'Organization context required' });
                return;
            }
            const bundles = await bundlingService.getAll(req.organizationId);
            res.json(bundles);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.organizationId) {
                res.status(400).json({ error: 'Organization context required' });
                return;
            }
            const bundle = await bundlingService.getById(req.params.id, req.organizationId);
            if (!bundle) {
                res.status(404).json({ error: 'Bundle tidak ditemukan' });
                return;
            }
            res.json(bundle);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.organizationId) {
                res.status(400).json({ error: 'Organization context required' });
                return;
            }
            const bundle = await bundlingService.create(req.body, req.organizationId);
            res.status(201).json(bundle);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.organizationId) {
                res.status(400).json({ error: 'Organization context required' });
                return;
            }
            const bundle = await bundlingService.update(req.params.id, req.body, req.organizationId);
            res.json(bundle);
        } catch (error: any) {
            if (error.message === 'Bundle tidak ditemukan') {
                res.status(404).json({ error: error.message });
                return;
            }
            next(error);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.organizationId) {
                res.status(400).json({ error: 'Organization context required' });
                return;
            }
            await bundlingService.delete(req.params.id, req.organizationId);
            res.json({ message: 'Bundle deleted successfully' });
        } catch (error: any) {
            if (error.message === 'Bundle tidak ditemukan') {
                res.status(404).json({ error: error.message });
                return;
            }
            next(error);
        }
    }

    // Calculate HPP and pricing without saving (for preview)
    async calculate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { items, promotionType, discountValue, bundlePrice } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                res.status(400).json({ error: 'Items are required' });
                return;
            }

            const calculation = await bundlingService.calculate(
                items,
                promotionType || 'DISCOUNT',
                discountValue,
                bundlePrice
            );
            res.json(calculation);
        } catch (error) {
            next(error);
        }
    }
}

export default new BundlingController();
