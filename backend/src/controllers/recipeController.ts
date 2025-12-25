import { Request, Response, NextFunction } from 'express';
import recipeService from '../services/recipeService';

class RecipeController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.organizationId) {
                res.status(400).json({ error: 'Organization context required' });
                return;
            }
            const recipes = await recipeService.getAll(req.organizationId);
            res.json(recipes);
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
            const recipe = await recipeService.getById(req.params.id, req.organizationId);
            if (!recipe) {
                res.status(404).json({ error: 'Recipe tidak ditemukan' });
                return;
            }
            res.json(recipe);
        } catch (error) {
            next(error);
        }
    }

    async getAvailableComponents(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.organizationId) {
                res.status(400).json({ error: 'Organization context required' });
                return;
            }
            const excludeId = req.query.excludeId as string | undefined;
            const components = await recipeService.getAvailableComponents(req.organizationId, excludeId);
            res.json(components);
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
            const recipe = await recipeService.create(req.body, req.organizationId);
            res.status(201).json(recipe);
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
            const recipe = await recipeService.update(req.params.id, req.body, req.organizationId);
            res.json(recipe);
        } catch (error: any) {
            if (error.message === 'Resep tidak ditemukan') {
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
            await recipeService.delete(req.params.id, req.organizationId);
            res.json({ message: 'Recipe deleted successfully' });
        } catch (error: any) {
            if (error.message === 'Resep tidak ditemukan') {
                res.status(404).json({ error: error.message });
                return;
            }
            next(error);
        }
    }
}

export default new RecipeController();
