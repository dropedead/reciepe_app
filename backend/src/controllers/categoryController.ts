import { Request, Response, NextFunction } from 'express';
import categoryService from '../services/categoryService';

class CategoryController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.organizationId) {
                res.status(400).json({ error: 'Organization context required' });
                return;
            }
            const categories = await categoryService.getAll(req.organizationId);
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
            const category = await categoryService.getById(req.params.id, req.organizationId);
            if (!category) {
                res.status(404).json({ error: 'Kategori tidak ditemukan' });
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
            const category = await categoryService.create(req.body, req.organizationId);
            res.status(201).json(category);
        } catch (error: any) {
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'Kategori dengan nama tersebut sudah ada' });
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
            const category = await categoryService.update(req.params.id, req.body, req.organizationId);
            res.json(category);
        } catch (error: any) {
            if (error.message === 'Kategori tidak ditemukan') {
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
            await categoryService.delete(req.params.id, req.organizationId);
            res.json({ message: 'Category deleted successfully' });
        } catch (error: any) {
            if (error.message === 'Kategori tidak ditemukan') {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.code === 'P2003') {
                res.status(400).json({ error: 'Kategori masih digunakan oleh bahan baku' });
                return;
            }
            next(error);
        }
    }
}

export default new CategoryController();
