import prisma from '../config/database';

interface CategoryData {
    name: string;
    description?: string;
}

class CategoryService {
    async getAll(organizationId: number) {
        const categories = await prisma.category.findMany({
            where: { organizationId },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { Ingredient: true }
                }
            }
        });

        // Map _count.Ingredient to _count.ingredients for frontend compatibility
        return categories.map(cat => ({
            ...cat,
            _count: {
                ingredients: cat._count.Ingredient
            }
        }));
    }

    async getById(id: string, organizationId: number) {
        return await prisma.category.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            },
            include: {
                _count: {
                    select: { Ingredient: true }
                }
            }
        });
    }

    async create(data: CategoryData, organizationId: number) {
        const { name, description } = data;
        return await prisma.category.create({
            data: { name, description, organizationId }
        });
    }

    async update(id: string, data: CategoryData, organizationId: number) {
        // Verify category belongs to organization
        const category = await prisma.category.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!category) {
            throw new Error('Kategori tidak ditemukan');
        }

        const { name, description } = data;
        return await prisma.category.update({
            where: { id: parseInt(id) },
            data: { name, description }
        });
    }

    async delete(id: string, organizationId: number) {
        // Verify category belongs to organization
        const category = await prisma.category.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!category) {
            throw new Error('Kategori tidak ditemukan');
        }

        return await prisma.category.delete({
            where: { id: parseInt(id) }
        });
    }
}

export default new CategoryService();
