import { Request, Response, NextFunction } from 'express';
import menuService from '../services/menuService';
import { calculateMenuTotalCost } from '../services/helpers';

class MenuController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.organizationId) {
                res.status(400).json({ error: 'Organization context required' });
                return;
            }
            const menus = await menuService.getAll(req.organizationId);
            res.json(menus);
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
            const menu = await menuService.getById(req.params.id, req.organizationId);
            if (!menu) {
                res.status(404).json({ error: 'Menu tidak ditemukan' });
                return;
            }
            res.json(menu);
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
            const menu = await menuService.create(req.body, req.organizationId);

            const totalCost = calculateMenuTotalCost(menu.recipes);
            const profit = menu.sellingPrice - totalCost;
            const profitMargin = menu.sellingPrice > 0 ? (profit / menu.sellingPrice) * 100 : 0;

            res.status(201).json({
                ...menu,
                totalCost,
                profit,
                profitMargin
            });
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
            const menu = await menuService.update(req.params.id, req.body, req.organizationId);

            const totalCost = calculateMenuTotalCost(menu.recipes);
            const profit = menu.sellingPrice - totalCost;
            const profitMargin = menu.sellingPrice > 0 ? (profit / menu.sellingPrice) * 100 : 0;

            res.json({
                ...menu,
                totalCost,
                profit,
                profitMargin
            });
        } catch (error: any) {
            if (error.message === 'Menu tidak ditemukan') {
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
            await menuService.delete(req.params.id, req.organizationId);
            res.json({ message: 'Menu deleted successfully' });
        } catch (error: any) {
            if (error.message === 'Menu tidak ditemukan') {
                res.status(404).json({ error: error.message });
                return;
            }
            next(error);
        }
    }
}

export default new MenuController();
