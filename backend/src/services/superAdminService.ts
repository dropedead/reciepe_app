import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get overall statistics
export const getStats = async () => {
    const [totalUsers, totalOrganizations, activeUsers] = await Promise.all([
        prisma.user.count(),
        prisma.organization.count(),
        prisma.user.count({
            where: {
                lastLoginAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
            }
        })
    ]);

    // Get user growth (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersLast7Days = await prisma.user.count({
        where: {
            createdAt: {
                gte: sevenDaysAgo
            }
        }
    });

    return {
        totalUsers,
        totalOrganizations,
        activeUsers,
        newUsersLast7Days
    };
};

// Get all users with pagination
export const getAllUsers = async (page: number = 1, limit: number = 20, search?: string) => {
    const skip = (page - 1) * limit;

    const where = search
        ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } }
            ]
        }
        : {};

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                provider: true,
                onboardingCompleted: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                organizations: {
                    select: {
                        role: true,
                        organization: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        }),
        prisma.user.count({ where })
    ]);

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// Get user activity summary
export const getUserActivity = async () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [loginsToday, loginsYesterday, loginsLastWeek, loginsLastMonth] = await Promise.all([
        prisma.user.count({
            where: { lastLoginAt: { gte: today } }
        }),
        prisma.user.count({
            where: { lastLoginAt: { gte: yesterday, lt: today } }
        }),
        prisma.user.count({
            where: { lastLoginAt: { gte: lastWeek } }
        }),
        prisma.user.count({
            where: { lastLoginAt: { gte: lastMonth } }
        })
    ]);

    return {
        loginsToday,
        loginsYesterday,
        loginsLastWeek,
        loginsLastMonth
    };
};

// Update last login time
export const updateLastLogin = async (userId: number) => {
    return prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() }
    });
};

// Check if user is super admin
export const isSuperAdmin = async (userId: number): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, email: true }
    });

    return user?.role === 'SUPERADMIN' || user?.email === 'superadmin';
};
