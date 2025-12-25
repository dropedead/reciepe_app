import { Request, Response, NextFunction } from 'express';
import ingredientService from '../services/ingredientService';

class IngredientController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.organizationId) {
                res.status(400).json({ error: 'Organization context required' });
                return;
            }
            const ingredients = await ingredientService.getAll(req.organizationId);
            res.json(ingredients);
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
            const ingredient = await ingredientService.getById(req.params.id, req.organizationId);
            if (!ingredient) {
                res.status(404).json({ error: 'Ingredient tidak ditemukan' });
                return;
            }
            res.json(ingredient);
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
            const ingredient = await ingredientService.create(req.body, req.organizationId);
            res.status(201).json(ingredient);
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
            const ingredient = await ingredientService.update(req.params.id, req.body, req.organizationId);
            res.json(ingredient);
        } catch (error: any) {
            if (error.message === 'Ingredient tidak ditemukan') {
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
            await ingredientService.delete(req.params.id, req.organizationId);
            res.json({ message: 'Ingredient deleted successfully' });
        } catch (error: any) {
            if (error.message === 'Ingredient tidak ditemukan') {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message === 'Tidak dapat menghapus bahan yang sedang digunakan oleh resep') {
                res.status(400).json({ error: error.message });
                return;
            }
            next(error);
        }
    }
}

export default new IngredientController();
