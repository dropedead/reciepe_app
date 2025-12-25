import prisma from '../config/database';
import { calculateMenuTotalCost } from './helpers';

interface MenuRecipe {
    recipeId: number | string;
    quantity: number | string;
}

interface MenuData {
    name: string;
    description?: string;
    imageUrl?: string;
    sellingPrice: number | string;
    categoryId?: number | string | null;
    isActive?: boolean;
    recipes: MenuRecipe[];
}

class MenuService {
    async getAll(organizationId: number) {
        const menus = await prisma.menu.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
            include: {
                MenuCategory: true,
                MenuRecipe: {
                    include: {
                        Recipe: {
                            include: {
                                RecipeIngredient: {
                                    include: {
                                        Ingredient: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return menus.map(menu => {
            const recipes = menu.MenuRecipe.map(mr => ({
                recipeId: mr.recipeId,
                quantity: mr.quantity,
                recipe: {
                    ...mr.Recipe,
                    ingredients: mr.Recipe.RecipeIngredient.map(ri => ({
                        ...ri,
                        ingredient: ri.Ingredient
                    }))
                }
            }));

            const totalCost = calculateMenuTotalCost(recipes);
            const profit = menu.sellingPrice - totalCost;
            const profitMargin = menu.sellingPrice > 0 ? (profit / menu.sellingPrice) * 100 : 0;

            return {
                ...menu,
                category: menu.MenuCategory,
                recipes,
                totalCost,
                profit,
                profitMargin
            };
        });
    }

    async getById(id: string, organizationId: number) {
        const menu = await prisma.menu.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            },
            include: {
                MenuCategory: true,
                MenuRecipe: {
                    include: {
                        Recipe: {
                            include: {
                                RecipeIngredient: {
                                    include: {
                                        Ingredient: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!menu) return null;

        const recipesCost = menu.MenuRecipe.map(mr => {
            const totalCost = mr.Recipe.RecipeIngredient.reduce((sum, ri) => {
                return sum + (ri.quantity * ri.Ingredient.pricePerUnit);
            }, 0);
            const costPerServing = mr.Recipe.servings > 0 ? totalCost / mr.Recipe.servings : 0;

            return {
                recipeId: mr.recipeId,
                recipeName: mr.Recipe.name,
                quantity: mr.quantity,
                costPerServing,
                subtotal: costPerServing * mr.quantity
            };
        });

        const totalCost = recipesCost.reduce((sum, rc) => sum + rc.subtotal, 0);
        const profit = menu.sellingPrice - totalCost;
        const profitMargin = menu.sellingPrice > 0 ? (profit / menu.sellingPrice) * 100 : 0;

        return {
            ...menu,
            category: menu.MenuCategory,
            recipes: menu.MenuRecipe.map(mr => ({
                ...mr,
                recipe: {
                    ...mr.Recipe,
                    ingredients: mr.Recipe.RecipeIngredient.map(ri => ({
                        ...ri,
                        ingredient: ri.Ingredient
                    }))
                }
            })),
            recipesCost,
            totalCost,
            profit,
            profitMargin
        };
    }

    async create(data: MenuData, organizationId: number) {
        const { name, description, imageUrl, sellingPrice, categoryId, isActive, recipes } = data;

        const menu = await prisma.menu.create({
            data: {
                name,
                description,
                imageUrl,
                sellingPrice: parseFloat(sellingPrice.toString()),
                categoryId: categoryId ? parseInt(categoryId.toString()) : null,
                isActive: isActive !== undefined ? isActive : true,
                organizationId,
                MenuRecipe: {
                    create: recipes.map(r => ({
                        recipeId: parseInt(r.recipeId.toString()),
                        quantity: parseInt(r.quantity.toString()) || 1
                    }))
                }
            },
            include: {
                MenuCategory: true,
                MenuRecipe: {
                    include: {
                        Recipe: {
                            include: {
                                RecipeIngredient: {
                                    include: {
                                        Ingredient: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return {
            ...menu,
            category: menu.MenuCategory,
            recipes: menu.MenuRecipe.map(mr => ({
                ...mr,
                recipe: {
                    ...mr.Recipe,
                    ingredients: mr.Recipe.RecipeIngredient.map(ri => ({
                        ...ri,
                        ingredient: ri.Ingredient
                    }))
                }
            }))
        };
    }

    async update(id: string, data: MenuData, organizationId: number) {
        const { name, description, imageUrl, sellingPrice, categoryId, isActive, recipes } = data;

        // Verify menu belongs to organization
        const existingMenu = await prisma.menu.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!existingMenu) {
            throw new Error('Menu tidak ditemukan');
        }

        // Delete existing menu recipes
        await prisma.menuRecipe.deleteMany({
            where: { menuId: parseInt(id) }
        });

        const menu = await prisma.menu.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                imageUrl,
                sellingPrice: parseFloat(sellingPrice.toString()),
                categoryId: categoryId ? parseInt(categoryId.toString()) : null,
                isActive,
                MenuRecipe: {
                    create: recipes.map(r => ({
                        recipeId: parseInt(r.recipeId.toString()),
                        quantity: parseInt(r.quantity.toString()) || 1
                    }))
                }
            },
            include: {
                MenuCategory: true,
                MenuRecipe: {
                    include: {
                        Recipe: {
                            include: {
                                RecipeIngredient: {
                                    include: {
                                        Ingredient: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return {
            ...menu,
            category: menu.MenuCategory,
            recipes: menu.MenuRecipe.map(mr => ({
                ...mr,
                recipe: {
                    ...mr.Recipe,
                    ingredients: mr.Recipe.RecipeIngredient.map(ri => ({
                        ...ri,
                        ingredient: ri.Ingredient
                    }))
                }
            }))
        };
    }

    async delete(id: string, organizationId: number) {
        // Verify menu belongs to organization
        const menu = await prisma.menu.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!menu) {
            throw new Error('Menu tidak ditemukan');
        }

        return await prisma.menu.delete({
            where: { id: parseInt(id) }
        });
    }
}

export default new MenuService();
