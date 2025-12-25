import prisma from '../config/database';

interface CategoryData {
    name: string;
    description?: string;
}

class RecipeCategoryService {
    async getAll(organizationId: number) {
        return await prisma.recipeCategory.findMany({
            where: { organizationId },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { Recipe: true }
                }
            }
        });
    }

    async getById(id: string, organizationId: number) {
        return await prisma.recipeCategory.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            },
            include: {
                Recipe: true
            }
        });
    }

    async create(data: CategoryData, organizationId: number) {
        return await prisma.recipeCategory.create({
            data: {
                name: data.name,
                description: data.description,
                organizationId
            }
        });
    }

    async update(id: string, data: CategoryData, organizationId: number) {
        const category = await prisma.recipeCategory.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!category) {
            throw new Error('Kategori resep tidak ditemukan');
        }

        return await prisma.recipeCategory.update({
            where: { id: parseInt(id) },
            data: {
                name: data.name,
                description: data.description
            }
        });
    }

    async delete(id: string, organizationId: number) {
        const category = await prisma.recipeCategory.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!category) {
            throw new Error('Kategori resep tidak ditemukan');
        }

        return await prisma.recipeCategory.delete({
            where: { id: parseInt(id) }
        });
    }
}

export default new RecipeCategoryService();
