import prisma from '../config/database';

interface RecipeIngredient {
    ingredientId: number | string;
    quantity: number | string;
}

interface RecipeComponent {
    subRecipeId: number | string;
    quantity: number | string;
}

interface RecipeData {
    name: string;
    description?: string;
    servings: number | string;
    categoryId?: number | string | null;
    imageUrl?: string;
    videoUrl?: string;
    sop?: string;
    ingredients: RecipeIngredient[];
    components?: RecipeComponent[];
}

// Helper function to calculate total cost of a recipe (including sub-recipes)
async function calculateTotalRecipeCost(recipe: any): Promise<number> {
    // Cost from ingredients
    let totalCost = recipe.RecipeIngredient?.reduce((sum: number, ri: any) => {
        return sum + (ri.quantity * ri.Ingredient.pricePerUnit);
    }, 0) || 0;

    // Cost from sub-recipes (components)
    if (recipe.RecipeComponent_RecipeComponent_parentRecipeIdToRecipe &&
        recipe.RecipeComponent_RecipeComponent_parentRecipeIdToRecipe.length > 0) {
        for (const component of recipe.RecipeComponent_RecipeComponent_parentRecipeIdToRecipe) {
            const subRecipeCost = await calculateSubRecipeCost(
                component.Recipe_RecipeComponent_subRecipeIdToRecipe,
                component.quantity
            );
            totalCost += subRecipeCost;
        }
    }

    return totalCost;
}

// Helper function to calculate cost of a sub-recipe
async function calculateSubRecipeCost(subRecipe: any, quantity: number): Promise<number> {
    const ingredientCost = subRecipe.RecipeIngredient?.reduce((sum: number, ri: any) => {
        return sum + (ri.quantity * ri.Ingredient.pricePerUnit);
    }, 0) || 0;

    const costPerServing = ingredientCost / (subRecipe.servings || 1);
    return costPerServing * quantity;
}

class RecipeService {
    async getAll(organizationId: number) {
        const recipes = await prisma.recipe.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
            include: {
                RecipeCategory: true,
                RecipeIngredient: {
                    include: {
                        Ingredient: true
                    }
                },
                RecipeComponent_RecipeComponent_parentRecipeIdToRecipe: {
                    include: {
                        Recipe_RecipeComponent_subRecipeIdToRecipe: {
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

        const recipesWithCosts = await Promise.all(recipes.map(async recipe => {
            const totalCost = await calculateTotalRecipeCost(recipe);
            const costPerServing = totalCost / (recipe.servings || 1);

            return {
                ...recipe,
                category: recipe.RecipeCategory,
                ingredients: recipe.RecipeIngredient.map(ri => ({
                    ...ri,
                    ingredient: ri.Ingredient
                })),
                components: recipe.RecipeComponent_RecipeComponent_parentRecipeIdToRecipe.map(c => ({
                    ...c,
                    subRecipe: c.Recipe_RecipeComponent_subRecipeIdToRecipe
                })),
                totalCost,
                costPerServing
            };
        }));

        return recipesWithCosts;
    }

    async getById(id: string, organizationId: number) {
        const recipe = await prisma.recipe.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            },
            include: {
                RecipeCategory: true,
                RecipeIngredient: {
                    include: {
                        Ingredient: true
                    }
                },
                RecipeComponent_RecipeComponent_parentRecipeIdToRecipe: {
                    include: {
                        Recipe_RecipeComponent_subRecipeIdToRecipe: {
                            include: {
                                RecipeIngredient: {
                                    include: {
                                        Ingredient: true
                                    }
                                }
                            }
                        }
                    }
                },
                RecipeComponent_RecipeComponent_subRecipeIdToRecipe: {
                    include: {
                        Recipe_RecipeComponent_parentRecipeIdToRecipe: true
                    }
                }
            }
        });

        if (recipe) {
            const totalCost = await calculateTotalRecipeCost(recipe);
            const costPerServing = totalCost / (recipe.servings || 1);

            const ingredientCosts = recipe.RecipeIngredient.map(ri => ({
                id: ri.id,
                name: ri.Ingredient.name,
                quantity: ri.quantity,
                unit: ri.Ingredient.usageUnit || ri.Ingredient.unit,
                pricePerUnit: ri.Ingredient.pricePerUnit,
                subtotal: ri.quantity * ri.Ingredient.pricePerUnit
            }));

            const componentCosts = await Promise.all(
                recipe.RecipeComponent_RecipeComponent_parentRecipeIdToRecipe.map(async comp => {
                    const subRecipe = comp.Recipe_RecipeComponent_subRecipeIdToRecipe;
                    const subRecipeCost = await calculateSubRecipeCost(subRecipe, comp.quantity);
                    const componentCostPerServing = subRecipe.RecipeIngredient.reduce((sum: number, ri: any) => {
                        return sum + (ri.quantity * ri.Ingredient.pricePerUnit);
                    }, 0) / (subRecipe.servings || 1);

                    return {
                        id: comp.id,
                        name: subRecipe.name,
                        quantity: comp.quantity,
                        unit: 'porsi',
                        costPerServing: componentCostPerServing,
                        subtotal: subRecipeCost
                    };
                })
            );

            return {
                ...recipe,
                category: recipe.RecipeCategory,
                ingredients: recipe.RecipeIngredient.map(ri => ({
                    ...ri,
                    ingredient: ri.Ingredient
                })),
                components: recipe.RecipeComponent_RecipeComponent_parentRecipeIdToRecipe.map(c => ({
                    ...c,
                    subRecipe: c.Recipe_RecipeComponent_subRecipeIdToRecipe
                })),
                usedAsComponentIn: recipe.RecipeComponent_RecipeComponent_subRecipeIdToRecipe.map(c => ({
                    ...c,
                    parentRecipe: c.Recipe_RecipeComponent_parentRecipeIdToRecipe
                })),
                totalCost,
                costPerServing,
                ingredientCosts,
                componentCosts
            };
        }

        return recipe;
    }

    async getAvailableComponents(organizationId: number, excludeRecipeId?: string) {
        const whereClause: any = { organizationId };
        if (excludeRecipeId) {
            whereClause.id = { not: parseInt(excludeRecipeId) };
        }

        const recipes = await prisma.recipe.findMany({
            where: whereClause,
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                servings: true,
                RecipeIngredient: {
                    include: {
                        Ingredient: true
                    }
                }
            }
        });

        return recipes.map(recipe => {
            const totalCost = recipe.RecipeIngredient.reduce((sum, ri) => {
                return sum + (ri.quantity * ri.Ingredient.pricePerUnit);
            }, 0);
            const costPerServing = totalCost / (recipe.servings || 1);

            return {
                id: recipe.id,
                name: recipe.name,
                servings: recipe.servings,
                costPerServing
            };
        });
    }

    async create(data: RecipeData, organizationId: number) {
        const { name, description, servings, categoryId, imageUrl, videoUrl, sop, ingredients, components } = data;

        const recipe = await prisma.recipe.create({
            data: {
                name,
                description,
                servings: parseInt(servings.toString()),
                categoryId: categoryId ? parseInt(categoryId.toString()) : null,
                imageUrl,
                videoUrl,
                sop,
                organizationId,
                RecipeIngredient: {
                    create: ingredients.map(ing => ({
                        ingredientId: parseInt(ing.ingredientId.toString()),
                        quantity: parseFloat(ing.quantity.toString())
                    }))
                },
                RecipeComponent_RecipeComponent_parentRecipeIdToRecipe: components && components.length > 0 ? {
                    create: components.map(comp => ({
                        subRecipeId: parseInt(comp.subRecipeId.toString()),
                        quantity: parseFloat(comp.quantity.toString())
                    }))
                } : undefined
            },
            include: {
                RecipeCategory: true,
                RecipeIngredient: {
                    include: {
                        Ingredient: true
                    }
                }
            }
        });

        return {
            ...recipe,
            category: recipe.RecipeCategory,
            ingredients: recipe.RecipeIngredient.map(ri => ({
                ...ri,
                ingredient: ri.Ingredient
            }))
        };
    }

    async update(id: string, data: RecipeData, organizationId: number) {
        const { name, description, servings, categoryId, imageUrl, videoUrl, sop, ingredients, components } = data;

        // Verify recipe belongs to organization
        const existingRecipe = await prisma.recipe.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!existingRecipe) {
            throw new Error('Resep tidak ditemukan');
        }

        // Delete existing ingredients and components
        await prisma.recipeIngredient.deleteMany({
            where: { recipeId: parseInt(id) }
        });
        await prisma.recipeComponent.deleteMany({
            where: { parentRecipeId: parseInt(id) }
        });

        const recipe = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                servings: parseInt(servings.toString()),
                categoryId: categoryId ? parseInt(categoryId.toString()) : null,
                imageUrl,
                videoUrl,
                sop,
                RecipeIngredient: {
                    create: ingredients.map(ing => ({
                        ingredientId: parseInt(ing.ingredientId.toString()),
                        quantity: parseFloat(ing.quantity.toString())
                    }))
                },
                RecipeComponent_RecipeComponent_parentRecipeIdToRecipe: components && components.length > 0 ? {
                    create: components.map(comp => ({
                        subRecipeId: parseInt(comp.subRecipeId.toString()),
                        quantity: parseFloat(comp.quantity.toString())
                    }))
                } : undefined
            },
            include: {
                RecipeCategory: true,
                RecipeIngredient: {
                    include: {
                        Ingredient: true
                    }
                }
            }
        });

        return {
            ...recipe,
            category: recipe.RecipeCategory,
            ingredients: recipe.RecipeIngredient.map(ri => ({
                ...ri,
                ingredient: ri.Ingredient
            }))
        };
    }

    async delete(id: string, organizationId: number) {
        // Verify recipe belongs to organization
        const recipe = await prisma.recipe.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!recipe) {
            throw new Error('Resep tidak ditemukan');
        }

        return await prisma.recipe.delete({
            where: { id: parseInt(id) }
        });
    }
}

export default new RecipeService();
