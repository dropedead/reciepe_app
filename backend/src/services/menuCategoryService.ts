import prisma from '../config/database';

interface CategoryData {
    name: string;
    description?: string;
}

class MenuCategoryService {
    async getAll(organizationId: number) {
        return await prisma.menuCategory.findMany({
            where: { organizationId },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { Menu: true }
                }
            }
        });
    }

    async getById(id: string, organizationId: number) {
        return await prisma.menuCategory.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            },
            include: {
                Menu: true
            }
        });
    }

    async create(data: CategoryData, organizationId: number) {
        return await prisma.menuCategory.create({
            data: {
                name: data.name,
                description: data.description,
                organizationId
            }
        });
    }

    async update(id: string, data: CategoryData, organizationId: number) {
        const category = await prisma.menuCategory.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!category) {
            throw new Error('Kategori menu tidak ditemukan');
        }

        return await prisma.menuCategory.update({
            where: { id: parseInt(id) },
            data: {
                name: data.name,
                description: data.description
            }
        });
    }

    async delete(id: string, organizationId: number) {
        const category = await prisma.menuCategory.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!category) {
            throw new Error('Kategori menu tidak ditemukan');
        }

        return await prisma.menuCategory.delete({
            where: { id: parseInt(id) }
        });
    }
}

export default new MenuCategoryService();
