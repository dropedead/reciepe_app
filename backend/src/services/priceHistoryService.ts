import prisma from '../config/database';

interface PriceHistoryData {
    ingredientId: number | string;
    purchasePrice: number | string;
    purchaseUnit: string;
    supplier?: string;
    notes?: string;
    recordedAt?: Date | string;
}

class PriceHistoryService {
    // Get all price history records for an ingredient
    async getByIngredient(ingredientId: string, organizationId: number, limit?: number) {
        // Verify ingredient belongs to organization
        const ingredient = await prisma.ingredient.findFirst({
            where: { id: parseInt(ingredientId), organizationId }
        });
        if (!ingredient) {
            throw new Error('Ingredient tidak ditemukan');
        }

        return await prisma.priceHistory.findMany({
            where: { ingredientId: parseInt(ingredientId) },
            orderBy: { recordedAt: 'desc' },
            take: limit,
            include: {
                Ingredient: {
                    select: {
                        id: true,
                        name: true,
                        purchaseUnit: true
                    }
                }
            }
        });
    }

    // Get all price history (for report)
    async getAll(organizationId: number, limit?: number) {
        return await prisma.priceHistory.findMany({
            where: {
                Ingredient: { organizationId }
            },
            orderBy: { recordedAt: 'desc' },
            take: limit || 100,
            include: {
                Ingredient: {
                    select: {
                        id: true,
                        name: true,
                        purchaseUnit: true,
                        Category: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
    }

    // Get price trends for multiple ingredients (for comparison chart)
    async getPriceTrends(ingredientIds: number[], organizationId: number, months: number = 6) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        return await prisma.priceHistory.findMany({
            where: {
                ingredientId: { in: ingredientIds },
                Ingredient: { organizationId },
                recordedAt: { gte: startDate }
            },
            orderBy: { recordedAt: 'asc' },
            include: {
                Ingredient: {
                    select: {
                        id: true,
                        name: true,
                        purchaseUnit: true
                    }
                }
            }
        });
    }

    // Get price statistics for an ingredient
    async getStatistics(ingredientId: string, organizationId: number, months: number = 6) {
        // Verify ingredient belongs to organization
        const ingredient = await prisma.ingredient.findFirst({
            where: { id: parseInt(ingredientId), organizationId }
        });
        if (!ingredient) {
            throw new Error('Ingredient tidak ditemukan');
        }

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const history = await prisma.priceHistory.findMany({
            where: {
                ingredientId: parseInt(ingredientId),
                recordedAt: { gte: startDate }
            },
            orderBy: { recordedAt: 'asc' }
        });

        if (history.length === 0) {
            return {
                count: 0,
                minPrice: 0,
                maxPrice: 0,
                avgPrice: 0,
                currentPrice: 0,
                priceChange: 0,
                priceChangePercent: 0
            };
        }

        const prices = history.map(h => h.purchasePrice);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const firstPrice = history[0].purchasePrice;
        const currentPrice = history[history.length - 1].purchasePrice;
        const priceChange = currentPrice - firstPrice;
        const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100) : 0;

        return {
            count: history.length,
            minPrice,
            maxPrice,
            avgPrice: Math.round(avgPrice),
            currentPrice,
            priceChange,
            priceChangePercent: Math.round(priceChangePercent * 100) / 100,
            history
        };
    }

    // Add new price record
    async create(data: PriceHistoryData, organizationId: number) {
        const { ingredientId, purchasePrice, purchaseUnit, supplier, notes, recordedAt } = data;

        // Verify ingredient belongs to organization
        const ingredient = await prisma.ingredient.findFirst({
            where: { id: parseInt(ingredientId.toString()), organizationId }
        });
        if (!ingredient) {
            throw new Error('Ingredient tidak ditemukan');
        }

        return await prisma.priceHistory.create({
            data: {
                ingredientId: parseInt(ingredientId.toString()),
                purchasePrice: parseFloat(purchasePrice.toString()),
                purchaseUnit,
                supplier: supplier || null,
                notes: notes || null,
                recordedAt: recordedAt ? new Date(recordedAt) : new Date()
            },
            include: {
                Ingredient: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }

    // Record current price for an ingredient (called when ingredient is updated)
    async recordCurrentPrice(ingredientId: number, purchasePrice: number, purchaseUnit: string, notes?: string) {
        // Check if the last recorded price is different
        const lastRecord = await prisma.priceHistory.findFirst({
            where: { ingredientId },
            orderBy: { recordedAt: 'desc' }
        });

        // Only record if price changed or no previous record
        if (!lastRecord || lastRecord.purchasePrice !== purchasePrice) {
            return await prisma.priceHistory.create({
                data: {
                    ingredientId,
                    purchasePrice,
                    purchaseUnit,
                    notes: notes || (lastRecord ? 'Price updated' : 'Initial price')
                }
            });
        }
        return null;
    }

    // Delete a price history record
    async delete(id: string, organizationId: number) {
        // Verify the price history belongs to an ingredient in the organization
        const priceHistory = await prisma.priceHistory.findFirst({
            where: { id: parseInt(id) },
            include: { Ingredient: true }
        });

        if (!priceHistory || priceHistory.Ingredient.organizationId !== organizationId) {
            throw new Error('Record tidak ditemukan');
        }

        return await prisma.priceHistory.delete({
            where: { id: parseInt(id) }
        });
    }

    // Get summary report for all ingredients in organization
    async getSummaryReport(organizationId: number) {
        const ingredients = await prisma.ingredient.findMany({
            where: { organizationId },
            include: {
                Category: true,
                PriceHistory: {
                    orderBy: { recordedAt: 'desc' },
                    take: 2
                }
            }
        });

        return ingredients.map(ing => {
            const currentPrice = ing.purchasePrice;
            const previousPrice = ing.PriceHistory[1]?.purchasePrice || currentPrice;
            const priceChange = currentPrice - previousPrice;
            const priceChangePercent = previousPrice > 0 ? ((priceChange / previousPrice) * 100) : 0;

            return {
                id: ing.id,
                name: ing.name,
                category: ing.Category?.name || 'Uncategorized',
                purchaseUnit: ing.purchaseUnit,
                currentPrice,
                previousPrice,
                priceChange,
                priceChangePercent: Math.round(priceChangePercent * 100) / 100,
                lastUpdated: ing.PriceHistory[0]?.recordedAt || ing.updatedAt,
                historyCount: ing.PriceHistory.length
            };
        });
    }
}

export default new PriceHistoryService();
