import prisma from '../config/database';

export interface CreateOrganizationInput {
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
}

export interface UpdateOrganizationInput {
    name?: string;
    description?: string;
    logoUrl?: string;
    isActive?: boolean;
}

export interface AddMemberInput {
    email: string;
    role?: string;
}

class OrganizationService {
    // Generate unique slug from name
    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    // Check if slug is unique
    private async isSlugUnique(slug: string, excludeId?: number): Promise<boolean> {
        const existing = await prisma.organization.findUnique({
            where: { slug },
        });
        if (!existing) return true;
        if (excludeId && existing.id === excludeId) return true;
        return false;
    }

    // Create organization and add creator as OWNER
    async create(input: CreateOrganizationInput, userId: number) {
        let slug = input.slug || this.generateSlug(input.name);

        // Ensure unique slug
        let counter = 1;
        const baseSlug = slug;
        while (!(await this.isSlugUnique(slug))) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const organization = await prisma.organization.create({
            data: {
                name: input.name,
                slug,
                description: input.description,
                logoUrl: input.logoUrl,
                members: {
                    create: {
                        userId,
                        role: 'OWNER',
                        isDefault: true,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });

        return organization;
    }

    // Get organization by ID
    async getById(id: number) {
        return prisma.organization.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        categories: true,
                        ingredients: true,
                        recipes: true,
                        menus: true,
                    },
                },
            },
        });
    }

    // Get organization by slug
    async getBySlug(slug: string) {
        return prisma.organization.findUnique({
            where: { slug },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
    }

    // Get all organizations for a user
    async getUserOrganizations(userId: number) {
        const memberships = await prisma.organizationMember.findMany({
            where: { userId },
            include: {
                organization: {
                    include: {
                        _count: {
                            select: {
                                members: true,
                                recipes: true,
                                menus: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                { isDefault: 'desc' },
                { joinedAt: 'asc' },
            ],
        });

        return memberships.map((m) => ({
            ...m.organization,
            role: m.role,
            isDefault: m.isDefault,
            joinedAt: m.joinedAt,
        }));
    }

    // Get user's default organization
    async getUserDefaultOrganization(userId: number) {
        const membership = await prisma.organizationMember.findFirst({
            where: { userId, isDefault: true },
            include: {
                organization: true,
            },
        });

        if (!membership) {
            // If no default, get first organization
            const firstMembership = await prisma.organizationMember.findFirst({
                where: { userId },
                include: {
                    organization: true,
                },
                orderBy: { joinedAt: 'asc' },
            });
            return firstMembership?.organization || null;
        }

        return membership.organization;
    }

    // Update organization
    async update(id: number, input: UpdateOrganizationInput) {
        return prisma.organization.update({
            where: { id },
            data: {
                name: input.name,
                description: input.description,
                logoUrl: input.logoUrl,
                isActive: input.isActive,
            },
        });
    }

    // Delete organization
    async delete(id: number) {
        return prisma.organization.delete({
            where: { id },
        });
    }

    // Check if user is member of organization
    async isMember(userId: number, organizationId: number): Promise<boolean> {
        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });
        return !!membership;
    }

    // Get user's role in organization
    async getUserRole(userId: number, organizationId: number): Promise<string | null> {
        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });
        return membership?.role || null;
    }

    // Add member to organization
    async addMember(organizationId: number, input: AddMemberInput) {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: input.email },
        });

        if (!user) {
            throw new Error('User dengan email tersebut tidak ditemukan');
        }

        // Check if already a member
        const existingMembership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: user.id,
                    organizationId,
                },
            },
        });

        if (existingMembership) {
            throw new Error('User sudah menjadi member organisasi ini');
        }

        return prisma.organizationMember.create({
            data: {
                userId: user.id,
                organizationId,
                role: input.role || 'MEMBER',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    // Remove member from organization
    async removeMember(organizationId: number, userId: number) {
        // Check if user is OWNER
        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });

        if (membership?.role === 'OWNER') {
            // Check if there are other owners
            const otherOwners = await prisma.organizationMember.count({
                where: {
                    organizationId,
                    role: 'OWNER',
                    NOT: { userId },
                },
            });

            if (otherOwners === 0) {
                throw new Error('Tidak dapat menghapus owner terakhir dari organisasi');
            }
        }

        return prisma.organizationMember.delete({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });
    }

    // Update member role
    async updateMemberRole(organizationId: number, userId: number, newRole: string) {
        // Validate role
        if (!['OWNER', 'ADMIN', 'MEMBER'].includes(newRole)) {
            throw new Error('Role tidak valid');
        }

        // Check if changing from OWNER
        const currentMembership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });

        if (currentMembership?.role === 'OWNER' && newRole !== 'OWNER') {
            // Check if there are other owners
            const otherOwners = await prisma.organizationMember.count({
                where: {
                    organizationId,
                    role: 'OWNER',
                    NOT: { userId },
                },
            });

            if (otherOwners === 0) {
                throw new Error('Harus ada minimal satu owner di organisasi');
            }
        }

        return prisma.organizationMember.update({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
            data: { role: newRole },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    // Set user's default organization
    async setDefaultOrganization(userId: number, organizationId: number) {
        // Verify membership
        const isMember = await this.isMember(userId, organizationId);
        if (!isMember) {
            throw new Error('Anda bukan member dari organisasi ini');
        }

        // Remove default from all other memberships
        await prisma.organizationMember.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });

        // Set new default
        return prisma.organizationMember.update({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
            data: { isDefault: true },
            include: {
                organization: true,
            },
        });
    }

    // Get organization members
    async getMembers(organizationId: number) {
        return prisma.organizationMember.findMany({
            where: { organizationId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: [
                { role: 'asc' }, // OWNER first
                { joinedAt: 'asc' },
            ],
        });
    }
}

export default new OrganizationService();
