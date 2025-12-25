import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

class StatsController {
    async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.organizationId) {
                res.status(400).json({ error: 'Organization context required' });
                return;
            }

            const [totalRecipes, totalIngredients, recipes] = await Promise.all([
                prisma.recipe.count({ where: { organizationId: req.organizationId } }),
                prisma.ingredient.count({ where: { organizationId: req.organizationId } }),
                prisma.recipe.findMany({
                    where: { organizationId: req.organizationId },
                    include: {
                        RecipeIngredient: {
                            include: {
                                Ingredient: true
                            }
                        }
                    }
                })
            ]);

            // Calculate average HPP per serving
            let totalCostPerServing = 0;
            recipes.forEach(recipe => {
                const totalCost = recipe.RecipeIngredient.reduce((sum, ri) => {
                    return sum + (ri.quantity * ri.Ingredient.pricePerUnit);
                }, 0);
                const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;
                totalCostPerServing += costPerServing;
            });

            const averageHPP = recipes.length > 0 ? totalCostPerServing / recipes.length : 0;

            res.json({
                totalRecipes,
                totalIngredients,
                averageHPP
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new StatsController();
