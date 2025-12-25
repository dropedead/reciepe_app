import { Request, Response, NextFunction } from 'express';
import menuCategoryService from '../services/menuCategoryService';

class MenuCategoryController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.organizationId) {
                res.status(400).json({ error: 'Organization context required' });
                return;
            }
            const categories = await menuCategoryService.getAll(req.organizationId);
            res.json(categories);
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
            const category = await menuCategoryService.getById(req.params.id, req.organizationId);
            if (!category) {
                res.status(404).json({ error: 'Kategori menu tidak ditemukan' });
                return;
            }
            res.json(category);
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
            const category = await menuCategoryService.create(req.body, req.organizationId);
            res.status(201).json(category);
        } catch (error: any) {
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'Kategori menu dengan nama tersebut sudah ada' });
                return;
            }
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.organizationId) {
                res.status(400).json({ error: 'Organization context required' });
                return;
            }
            const category = await menuCategoryService.update(req.params.id, req.body, req.organizationId);
            res.json(category);
        } catch (error: any) {
            if (error.message === 'Kategori menu tidak ditemukan') {
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
            await menuCategoryService.delete(req.params.id, req.organizationId);
            res.json({ message: 'Menu category deleted successfully' });
        } catch (error: any) {
            if (error.message === 'Kategori menu tidak ditemukan') {
                res.status(404).json({ error: error.message });
                return;
            }
            next(error);
        }
    }
}

export default new MenuCategoryController();
