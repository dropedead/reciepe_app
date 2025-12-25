import prisma from '../config/database';
import { getDefaultConversionRate } from './unitConversion';

interface IngredientData {
    name: string;
    // Purchase info
    purchaseUnit: string;
    purchasePrice: number | string;
    packageSize?: number | string;
    // Yield info
    yieldPercentage?: number | string;
    // Usage info
    usageUnit: string;
    conversionRate?: number | string;
    // Legacy
    unit?: string;
    pricePerUnit?: number | string;
    // Category
    categoryId?: number | string | null;
    // Optional supplier for price tracking
    supplier?: string;
}

/**
 * Calculate price per usage unit considering yield percentage
 * Formula: purchasePrice / (conversionRate * yieldPercentage/100)
 */
const calculatePricePerUsageUnit = (
    purchasePrice: number,
    conversionRate: number,
    yieldPercentage: number = 100
): number => {
    if (conversionRate <= 0) return 0;
    const yieldFactor = Math.min(Math.max(yieldPercentage, 1), 100) / 100;
    const effectiveConversion = conversionRate * yieldFactor;
    return purchasePrice / effectiveConversion;
};

class IngredientService {
    async getAll(organizationId: number) {
        const ingredients = await prisma.ingredient.findMany({
            where: { organizationId },
            orderBy: { name: 'asc' },
            include: {
                Category: true
            }
        });

        // Ensure pricePerUnit is calculated correctly for each ingredient
        return ingredients.map(ing => ({
            ...ing,
            category: ing.Category,
            // Recalculate price per usage unit for display (considering yield)
            pricePerUnit: calculatePricePerUsageUnit(
                ing.purchasePrice,
                ing.conversionRate,
                ing.yieldPercentage
            )
        }));
    }

    async getById(id: string, organizationId: number) {
        const ingredient = await prisma.ingredient.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            },
            include: {
                Category: true
            }
        });

        if (ingredient) {
            return {
                ...ingredient,
                category: ingredient.Category,
                pricePerUnit: calculatePricePerUsageUnit(
                    ingredient.purchasePrice,
                    ingredient.conversionRate,
                    ingredient.yieldPercentage
                )
            };
        }
        return ingredient;
    }

    async create(data: IngredientData, organizationId: number) {
        const {
            name,
            purchaseUnit = 'kg',
            purchasePrice = 0,
            packageSize = 1,
            yieldPercentage = 100,
            usageUnit = 'gram',
            conversionRate,
            categoryId,
            supplier
        } = data;

        const parsedPurchasePrice = parseFloat(purchasePrice.toString()) || 0;
        const parsedPackageSize = parseFloat(packageSize?.toString() || '1') || 1;
        const parsedYieldPercentage = parseFloat(yieldPercentage?.toString() || '100') || 100;

        // Calculate conversion rate if not provided
        const calculatedConversionRate = conversionRate
            ? parseFloat(conversionRate.toString())
            : getDefaultConversionRate(purchaseUnit, usageUnit, parsedPackageSize);

        // Calculate price per usage unit (considering yield)
        const pricePerUsageUnit = calculatePricePerUsageUnit(
            parsedPurchasePrice,
            calculatedConversionRate,
            parsedYieldPercentage
        );

        // Create ingredient
        const ingredient = await prisma.ingredient.create({
            data: {
                name,
                purchaseUnit,
                purchasePrice: parsedPurchasePrice,
                packageSize: parsedPackageSize,
                yieldPercentage: parsedYieldPercentage,
                usageUnit,
                conversionRate: calculatedConversionRate,
                // Legacy fields for compatibility
                unit: usageUnit,
                pricePerUnit: pricePerUsageUnit,
                categoryId: categoryId ? parseInt(categoryId.toString()) : null,
                organizationId
            },
            include: {
                Category: true
            }
        });

        // Record initial price in history
        if (parsedPurchasePrice > 0) {
            await prisma.priceHistory.create({
                data: {
                    ingredientId: ingredient.id,
                    purchasePrice: parsedPurchasePrice,
                    purchaseUnit,
                    supplier: supplier || null,
                    notes: 'Initial price'
                }
            });
        }

        return { ...ingredient, category: ingredient.Category };
    }

    async update(id: string, data: IngredientData, organizationId: number) {
        const {
            name,
            purchaseUnit = 'kg',
            purchasePrice = 0,
            packageSize = 1,
            yieldPercentage = 100,
            usageUnit = 'gram',
            conversionRate,
            categoryId,
            supplier
        } = data;

        const parsedPurchasePrice = parseFloat(purchasePrice.toString()) || 0;
        const parsedPackageSize = parseFloat(packageSize?.toString() || '1') || 1;
        const parsedYieldPercentage = parseFloat(yieldPercentage?.toString() || '100') || 100;
        const ingredientId = parseInt(id);

        // Get current ingredient to check if price changed
        const currentIngredient = await prisma.ingredient.findFirst({
            where: {
                id: ingredientId,
                organizationId
            }
        });

        if (!currentIngredient) {
            throw new Error('Ingredient tidak ditemukan');
        }

        // Calculate conversion rate if not provided
        const calculatedConversionRate = conversionRate
            ? parseFloat(conversionRate.toString())
            : getDefaultConversionRate(purchaseUnit, usageUnit, parsedPackageSize);

        // Calculate price per usage unit (considering yield)
        const pricePerUsageUnit = calculatePricePerUsageUnit(
            parsedPurchasePrice,
            calculatedConversionRate,
            parsedYieldPercentage
        );

        // Update ingredient
        const updatedIngredient = await prisma.ingredient.update({
            where: { id: ingredientId },
            data: {
                name,
                purchaseUnit,
                purchasePrice: parsedPurchasePrice,
                packageSize: parsedPackageSize,
                yieldPercentage: parsedYieldPercentage,
                usageUnit,
                conversionRate: calculatedConversionRate,
                // Legacy fields for compatibility
                unit: usageUnit,
                pricePerUnit: pricePerUsageUnit,
                categoryId: categoryId ? parseInt(categoryId.toString()) : null
            },
            include: {
                Category: true
            }
        });

        // Record price change in history if price changed
        if (currentIngredient.purchasePrice !== parsedPurchasePrice) {
            const priceChange = parsedPurchasePrice - currentIngredient.purchasePrice;
            const changeDirection = priceChange > 0 ? '📈 Naik' : '📉 Turun';

            await prisma.priceHistory.create({
                data: {
                    ingredientId,
                    purchasePrice: parsedPurchasePrice,
                    purchaseUnit,
                    supplier: supplier || null,
                    notes: `${changeDirection} Rp ${Math.abs(priceChange).toLocaleString('id-ID')}`
                }
            });
        }

        return { ...updatedIngredient, category: updatedIngredient.Category };
    }

    async delete(id: string, organizationId: number) {
        // Verify ingredient belongs to organization
        const ingredient = await prisma.ingredient.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!ingredient) {
            throw new Error('Ingredient tidak ditemukan');
        }

        // Check if ingredient is used in any recipes
        const usedInRecipes = await prisma.recipeIngredient.count({
            where: {
                ingredientId: parseInt(id)
            }
        });

        if (usedInRecipes > 0) {
            throw new Error('Tidak dapat menghapus bahan yang sedang digunakan oleh resep');
        }

        return await prisma.ingredient.delete({
            where: { id: parseInt(id) }
        });
    }
}

export default new IngredientService();
