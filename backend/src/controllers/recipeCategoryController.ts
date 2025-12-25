import { Request, Response, NextFunction } from 'express';
import recipeCategoryService from '../services/recipeCategoryService';

class RecipeCategoryController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.organizationId) {
                res.status(400).json({ error: 'Organization context required' });
                return;
            }
            const categories = await recipeCategoryService.getAll(req.organizationId);
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
            const category = await recipeCategoryService.getById(req.params.id, req.organizationId);
            if (!category) {
                res.status(404).json({ error: 'Kategori resep tidak ditemukan' });
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
            const category = await recipeCategoryService.create(req.body, req.organizationId);
            res.status(201).json(category);
        } catch (error: any) {
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'Kategori resep dengan nama tersebut sudah ada' });
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
            const category = await recipeCategoryService.update(req.params.id, req.body, req.organizationId);
            res.json(category);
        } catch (error: any) {
            if (error.message === 'Kategori resep tidak ditemukan') {
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
            await recipeCategoryService.delete(req.params.id, req.organizationId);
            res.json({ message: 'Recipe category deleted successfully' });
        } catch (error: any) {
            if (error.message === 'Kategori resep tidak ditemukan') {
                res.status(404).json({ error: error.message });
                return;
            }
            next(error);
        }
    }
}

export default new RecipeCategoryController();
