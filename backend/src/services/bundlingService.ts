import prisma from '../config/database';

interface BundleItem {
    menuId: number | string;
    quantity: number | string;
    isFree?: boolean;
}

interface BundleData {
    name: string;
    description?: string;
    imageUrl?: string;
    promotionType: string;
    discountValue?: number | string;
    bundlePrice?: number | string;
    isActive?: boolean;
    validFrom?: string;
    validUntil?: string;
    items: BundleItem[];
}

// Promotion types
const PROMOTION_TYPES = {
    DISCOUNT: 'DISCOUNT',       // Fixed amount discount
    BUY1GET1: 'BUY1GET1',       // Buy 1 get 1 free
    BUY2GET1: 'BUY2GET1',       // Buy 2 get 1 free
    PERCENTAGE: 'PERCENTAGE',   // Percentage discount
    FIXED_PRICE: 'FIXED_PRICE'  // Fixed bundle price
};

class BundlingService {
    // Get all bundles for organization
    async getAll(organizationId: number) {
        const bundles = await prisma.menuBundle.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        menu: {
                            include: {
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
                        }
                    }
                }
            }
        });

        return bundles.map(bundle => this.enrichBundleWithCalculations(bundle));
    }

    // Get bundle by ID
    async getById(id: string, organizationId: number) {
        const bundle = await prisma.menuBundle.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            },
            include: {
                items: {
                    include: {
                        menu: {
                            include: {
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
                        }
                    }
                }
            }
        });

        if (!bundle) return null;

        return this.enrichBundleWithCalculations(bundle);
    }

    // Create new bundle
    async create(data: BundleData, organizationId: number) {
        const {
            name,
            description,
            imageUrl,
            promotionType,
            discountValue,
            bundlePrice,
            isActive,
            validFrom,
            validUntil,
            items
        } = data;

        const bundle = await prisma.menuBundle.create({
            data: {
                name,
                description,
                imageUrl,
                promotionType: promotionType || PROMOTION_TYPES.DISCOUNT,
                discountValue: discountValue ? parseFloat(discountValue.toString()) : null,
                bundlePrice: bundlePrice ? parseFloat(bundlePrice.toString()) : null,
                isActive: isActive !== undefined ? isActive : true,
                validFrom: validFrom ? new Date(validFrom) : null,
                validUntil: validUntil ? new Date(validUntil) : null,
                organizationId,
                items: {
                    create: items.map(item => ({
                        menuId: parseInt(item.menuId.toString()),
                        quantity: parseInt(item.quantity.toString()) || 1,
                        isFree: item.isFree || false
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        menu: {
                            include: {
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
                        }
                    }
                }
            }
        });

        return this.enrichBundleWithCalculations(bundle);
    }

    // Update bundle
    async update(id: string, data: BundleData, organizationId: number) {
        const existingBundle = await prisma.menuBundle.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!existingBundle) {
            throw new Error('Bundle tidak ditemukan');
        }

        // Delete existing items
        await prisma.menuBundleItem.deleteMany({
            where: { bundleId: parseInt(id) }
        });

        const {
            name,
            description,
            imageUrl,
            promotionType,
            discountValue,
            bundlePrice,
            isActive,
            validFrom,
            validUntil,
            items
        } = data;

        const bundle = await prisma.menuBundle.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                imageUrl,
                promotionType: promotionType || PROMOTION_TYPES.DISCOUNT,
                discountValue: discountValue ? parseFloat(discountValue.toString()) : null,
                bundlePrice: bundlePrice ? parseFloat(bundlePrice.toString()) : null,
                isActive,
                validFrom: validFrom ? new Date(validFrom) : null,
                validUntil: validUntil ? new Date(validUntil) : null,
                items: {
                    create: items.map(item => ({
                        menuId: parseInt(item.menuId.toString()),
                        quantity: parseInt(item.quantity.toString()) || 1,
                        isFree: item.isFree || false
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        menu: {
                            include: {
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
                        }
                    }
                }
            }
        });

        return this.enrichBundleWithCalculations(bundle);
    }

    // Delete bundle
    async delete(id: string, organizationId: number) {
        const bundle = await prisma.menuBundle.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!bundle) {
            throw new Error('Bundle tidak ditemukan');
        }

        return await prisma.menuBundle.delete({
            where: { id: parseInt(id) }
        });
    }

    // Calculate HPP without saving (for preview)
    async calculate(items: BundleItem[], promotionType: string, discountValue?: number, bundlePrice?: number) {
        const menuIds = items.map(item => parseInt(item.menuId.toString()));

        const menus = await prisma.menu.findMany({
            where: { id: { in: menuIds } },
            include: {
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

        const menuMap = new Map(menus.map(m => [m.id, m]));

        const enrichedItems = items.map(item => {
            const menuId = parseInt(item.menuId.toString());
            const menu = menuMap.get(menuId);
            if (!menu) return null;

            const hpp = this.calculateMenuHPP(menu);
            const quantity = parseInt(item.quantity.toString()) || 1;
            const isFree = item.isFree || false;

            return {
                menuId,
                menuName: menu.name,
                sellingPrice: menu.sellingPrice,
                hpp,
                quantity,
                isFree,
                subtotalHPP: hpp * quantity,
                subtotalPrice: isFree ? 0 : menu.sellingPrice * quantity
            };
        }).filter(item => item !== null);

        const totalHPP = enrichedItems.reduce((sum, item) => sum + item!.subtotalHPP, 0);
        const originalPrice = enrichedItems.reduce((sum, item) => sum + (item!.sellingPrice * item!.quantity), 0);

        // Calculate final price based on promotion type
        let finalPrice = originalPrice;
        let discount = 0;

        switch (promotionType) {
            case PROMOTION_TYPES.DISCOUNT:
                discount = discountValue || 0;
                finalPrice = originalPrice - discount;
                break;
            case PROMOTION_TYPES.PERCENTAGE:
                discount = originalPrice * ((discountValue || 0) / 100);
                finalPrice = originalPrice - discount;
                break;
            case PROMOTION_TYPES.FIXED_PRICE:
                finalPrice = bundlePrice || originalPrice;
                discount = originalPrice - finalPrice;
                break;
            case PROMOTION_TYPES.BUY1GET1:
            case PROMOTION_TYPES.BUY2GET1:
                // For BOGO, free items are already marked with isFree
                finalPrice = enrichedItems.reduce((sum, item) => sum + item!.subtotalPrice, 0);
                discount = originalPrice - finalPrice;
                break;
        }

        const profit = finalPrice - totalHPP;
        const profitMargin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;

        // Generate suggested prices at different margins
        const suggestedPrices = this.generateSuggestedPrices(totalHPP);

        return {
            items: enrichedItems,
            totalHPP,
            originalPrice,
            discount,
            finalPrice,
            profit,
            profitMargin,
            suggestedPrices
        };
    }

    // Helper: Enrich bundle with calculations
    private enrichBundleWithCalculations(bundle: any) {
        const items = bundle.items.map((item: any) => {
            const hpp = this.calculateMenuHPP(item.menu);
            return {
                ...item,
                hpp,
                subtotalHPP: hpp * item.quantity,
                subtotalPrice: item.isFree ? 0 : item.menu.sellingPrice * item.quantity
            };
        });

        const totalHPP = items.reduce((sum: number, item: any) => sum + item.subtotalHPP, 0);
        const originalPrice = items.reduce((sum: number, item: any) =>
            sum + (item.menu.sellingPrice * item.quantity), 0);

        // Calculate final price based on promotion type
        let finalPrice = originalPrice;
        let discount = 0;

        switch (bundle.promotionType) {
            case PROMOTION_TYPES.DISCOUNT:
                discount = bundle.discountValue || 0;
                finalPrice = originalPrice - discount;
                break;
            case PROMOTION_TYPES.PERCENTAGE:
                discount = originalPrice * ((bundle.discountValue || 0) / 100);
                finalPrice = originalPrice - discount;
                break;
            case PROMOTION_TYPES.FIXED_PRICE:
                finalPrice = bundle.bundlePrice || originalPrice;
                discount = originalPrice - finalPrice;
                break;
            case PROMOTION_TYPES.BUY1GET1:
            case PROMOTION_TYPES.BUY2GET1:
                finalPrice = items.reduce((sum: number, item: any) => sum + item.subtotalPrice, 0);
                discount = originalPrice - finalPrice;
                break;
        }

        const profit = finalPrice - totalHPP;
        const profitMargin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;

        const suggestedPrices = this.generateSuggestedPrices(totalHPP);

        return {
            ...bundle,
            items,
            totalHPP,
            originalPrice,
            discount,
            finalPrice,
            profit,
            profitMargin,
            suggestedPrices
        };
    }

    // Helper: Calculate HPP for a single menu
    private calculateMenuHPP(menu: any): number {
        if (!menu.MenuRecipe || menu.MenuRecipe.length === 0) return 0;

        return menu.MenuRecipe.reduce((total: number, mr: any) => {
            const recipe = mr.Recipe;
            if (!recipe.RecipeIngredient) return total;

            const recipeCost = recipe.RecipeIngredient.reduce((sum: number, ri: any) => {
                return sum + (ri.quantity * ri.Ingredient.pricePerUnit);
            }, 0);

            const costPerServing = recipe.servings > 0 ? recipeCost / recipe.servings : 0;
            return total + (costPerServing * mr.quantity);
        }, 0);
    }

    // Helper: Generate suggested prices at different profit margins
    private generateSuggestedPrices(hpp: number) {
        const margins = [20, 30, 40, 50, 60, 70];
        return margins.map(margin => ({
            margin,
            price: Math.ceil(hpp / (1 - margin / 100) / 1000) * 1000, // Round up to nearest 1000
            profit: Math.ceil(hpp / (1 - margin / 100) / 1000) * 1000 - hpp
        }));
    }
}

export default new BundlingService();
