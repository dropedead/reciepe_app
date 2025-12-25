import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface RegisterInput {
    email: string;
    password: string;
    name: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResult {
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
        isVerified: boolean;
        defaultOrganization?: {
            id: number;
            name: string;
            slug: string;
        };
    };
    token: string;
}

// Default units to seed for new organizations
const DEFAULT_UNITS = [
    { name: 'gram', label: 'Gram (g)', group: 'mass', baseValue: 1, isBaseUnit: true, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'kg', label: 'Kilogram (kg)', group: 'mass', baseValue: 1000, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'ons', label: 'Ons (100g)', group: 'mass', baseValue: 100, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'ml', label: 'Mililiter (ml)', group: 'volume', baseValue: 1, isBaseUnit: true, isPurchaseUnit: false, isUsageUnit: true },
    { name: 'liter', label: 'Liter', group: 'volume', baseValue: 1000, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'sdm', label: 'Sendok Makan (sdm)', group: 'volume', baseValue: 15, isBaseUnit: false, isPurchaseUnit: false, isUsageUnit: true },
    { name: 'sdt', label: 'Sendok Teh (sdt)', group: 'volume', baseValue: 5, isBaseUnit: false, isPurchaseUnit: false, isUsageUnit: true },
    { name: 'pcs', label: 'Pcs / Buah', group: 'count', baseValue: 1, isBaseUnit: true, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'butir', label: 'Butir', group: 'count', baseValue: 1, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'bungkus', label: 'Bungkus', group: 'count', baseValue: 1, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: true },
];

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (userId: number): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
export const verifyToken = (token: string): { userId: number } | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: number };
    } catch {
        return null;
    }
};

// Generate random token for email verification
export const generateVerifyToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

// Generate slug from name
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

// Register new user with auto-created organization
export const register = async (input: RegisterInput): Promise<AuthResult> => {
    const { email, password, name } = input;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('Email sudah terdaftar');
    }

    // Validate password
    if (password.length < 6) {
        throw new Error('Password minimal 6 karakter');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    const verifyTokenValue = generateVerifyToken();

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            verifyToken: verifyTokenValue,
            role: 'OWNER',
        },
    });

    // Generate organization slug from user's name
    let orgSlug = generateSlug(`${name}-organization`);
    let counter = 1;

    // Ensure unique slug
    while (await prisma.organization.findUnique({ where: { slug: orgSlug } })) {
        orgSlug = `${generateSlug(`${name}-organization`)}-${counter}`;
        counter++;
    }

    // Create default organization for user
    const organization = await prisma.organization.create({
        data: {
            name: `${name}'s Organization`,
            slug: orgSlug,
            description: 'Organisasi default',
            members: {
                create: {
                    userId: user.id,
                    role: 'OWNER',
                    isDefault: true,
                },
            },
        },
    });

    // Seed default units for the organization
    for (const unit of DEFAULT_UNITS) {
        await prisma.unit.create({
            data: {
                ...unit,
                organizationId: organization.id,
            },
        });
    }

    // Generate token
    const token = generateToken(user.id);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isVerified: user.isVerified,
            defaultOrganization: {
                id: organization.id,
                name: organization.name,
                slug: organization.slug,
            },
        },
        token,
    };
};

// Login user
export const login = async (input: LoginInput): Promise<AuthResult> => {
    const { email, password } = input;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Email atau password salah');
    }

    // Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        throw new Error('Email atau password salah');
    }

    // Get user's default organization
    const defaultMembership = await prisma.organizationMember.findFirst({
        where: { userId: user.id, isDefault: true },
        include: { organization: true },
    });

    // Generate token
    const token = generateToken(user.id);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isVerified: user.isVerified,
            defaultOrganization: defaultMembership ? {
                id: defaultMembership.organization.id,
                name: defaultMembership.organization.name,
                slug: defaultMembership.organization.slug,
            } : undefined,
        },
        token,
    };
};

// Get user by ID
export const getUserById = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
            isVerified: true,
            createdAt: true,
        },
    });
    return user;
};

// Get user with organizations
export const getUserWithOrganizations = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            organizations: {
                include: {
                    organization: true,
                },
                orderBy: [
                    { isDefault: 'desc' },
                    { joinedAt: 'asc' },
                ],
            },
        },
    });

    if (!user) return null;

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        organizations: user.organizations.map((m) => ({
            id: m.organization.id,
            name: m.organization.name,
            slug: m.organization.slug,
            role: m.role,
            isDefault: m.isDefault,
        })),
    };
};

// Verify email
export const verifyEmail = async (token: string): Promise<boolean> => {
    const user = await prisma.user.findFirst({ where: { verifyToken: token } });
    if (!user) {
        throw new Error('Token verifikasi tidak valid');
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            isVerified: true,
            verifyToken: null,
        },
    });

    return true;
};

// Request password reset
export const requestPasswordReset = async (email: string): Promise<string> => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Email tidak ditemukan');
    }

    const resetToken = generateVerifyToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken,
            resetExpires,
        },
    });

    return resetToken;
};

// Reset password
export const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetExpires: { gt: new Date() },
        },
    });

    if (!user) {
        throw new Error('Token reset tidak valid atau sudah expired');
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetExpires: null,
        },
    });

    return true;
};

// Change password (for authenticated users)
export const changePassword = async (userId: number, currentPassword: string, newPassword: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error('User tidak ditemukan');
    }

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
        throw new Error('Password saat ini salah');
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    return true;
};

// Update user profile
export interface UpdateProfileInput {
    name?: string;
    email?: string;
    avatar?: string;
}

export const updateProfile = async (userId: number, input: UpdateProfileInput) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error('User tidak ditemukan');
    }

    const updateData: any = {};
    let emailChanged = false;

    // Update name if provided
    if (input.name && input.name !== user.name) {
        updateData.name = input.name;
    }

    // Update email if provided and different
    if (input.email && input.email !== user.email) {
        // Check if email is already used by another user
        const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
        if (existingUser && existingUser.id !== userId) {
            throw new Error('Email sudah digunakan oleh akun lain');
        }
        updateData.email = input.email;
        updateData.isVerified = false; // Require re-verification
        updateData.verifyToken = generateVerifyToken();
        emailChanged = true;
    }

    // Update avatar if provided
    if (input.avatar !== undefined) {
        updateData.avatar = input.avatar;
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
        return { user, emailChanged: false };
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
            isVerified: true,
        },
    });

    return { user: updatedUser, emailChanged };
};


