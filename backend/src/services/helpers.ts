interface RecipeIngredient {
    quantity: number;
    ingredient: {
        pricePerUnit: number;
        purchasePrice?: number;
        conversionRate?: number;
        yieldPercentage?: number;
        usageUnit?: string;
    };
}

interface Recipe {
    servings: number;
    ingredients: RecipeIngredient[];
}

interface MenuRecipe {
    quantity: number;
    recipe: Recipe;
}

/**
 * Calculate price per usage unit considering yield percentage
 * Formula: purchasePrice / (conversionRate * yieldPercentage/100)
 */
export const getPricePerUsageUnit = (ingredient: RecipeIngredient['ingredient']): number => {
    // If we have new fields, calculate from them
    if (ingredient.purchasePrice !== undefined && ingredient.conversionRate !== undefined) {
        if (ingredient.conversionRate <= 0) return 0;

        // Apply yield factor (default 100% = no waste)
        const yieldFactor = (ingredient.yieldPercentage || 100) / 100;
        const effectiveConversion = ingredient.conversionRate * yieldFactor;

        return ingredient.purchasePrice / effectiveConversion;
    }
    // Fallback to legacy field (already calculated with yield)
    return ingredient.pricePerUnit || 0;
};

// Helper function to calculate recipe cost per serving
export const calculateRecipeCostPerServing = (recipe: Recipe): number => {
    if (!recipe.ingredients) return 0;
    const totalCost = recipe.ingredients.reduce((sum, ri) => {
        const pricePerUnit = getPricePerUsageUnit(ri.ingredient);
        return sum + (ri.quantity * pricePerUnit);
    }, 0);
    return recipe.servings > 0 ? totalCost / recipe.servings : 0;
};

// Helper function to calculate menu total cost from all recipes
export const calculateMenuTotalCost = (menuRecipes: MenuRecipe[]): number => {
    return menuRecipes.reduce((sum, mr) => {
        const costPerServing = calculateRecipeCostPerServing(mr.recipe);
        return sum + (costPerServing * mr.quantity);
    }, 0);
};

// Calculate total recipe cost (not per serving)
export const calculateRecipeTotalCost = (recipe: Recipe): number => {
    if (!recipe.ingredients) return 0;
    return recipe.ingredients.reduce((sum, ri) => {
        const pricePerUnit = getPricePerUsageUnit(ri.ingredient);
        return sum + (ri.quantity * pricePerUnit);
    }, 0);
};
