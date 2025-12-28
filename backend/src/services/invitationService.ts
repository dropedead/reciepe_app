import prisma from '../config/database';
import crypto from 'crypto';
import { createInvitationNotification } from './notificationService';

export interface CreateInvitationInput {
    email: string;
    organizationId: number;
    role?: string;
    invitedBy: number;
}

class InvitationService {
    // Generate random token
    private generateToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    // Create invitation
    async create(input: CreateInvitationInput) {
        // Check if user is registered in the system
        const existingUser = await prisma.user.findUnique({
            where: { email: input.email },
        });

        if (!existingUser) {
            throw new Error('Email tidak terdaftar di ResepKu. Hanya pengguna yang sudah terdaftar yang dapat diundang.');
        }

        // Check if user is already a member of this organization
        const existingMembership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: existingUser.id,
                    organizationId: input.organizationId,
                },
            },
        });

        if (existingMembership) {
            throw new Error('User sudah menjadi member organisasi ini');
        }

        // Check if there's already a pending invitation
        const existingInvitation = await prisma.invitation.findFirst({
            where: {
                email: input.email,
                organizationId: input.organizationId,
                status: 'PENDING',
            },
        });

        if (existingInvitation) {
            throw new Error('Sudah ada undangan pending untuk email ini');
        }

        // Create invitation with 7-day expiry
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invitation = await prisma.invitation.create({
            data: {
                email: input.email,
                organizationId: input.organizationId,
                role: input.role || 'MEMBER',
                invitedBy: input.invitedBy,
                token: this.generateToken(),
                expiresAt,
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Create in-app notification for the invitee
        await createInvitationNotification(
            existingUser.id,
            input.invitedBy,
            invitation.organization.name,
            invitation.id,
            invitation.role
        );

        return invitation;
    }

    // Get invitation by token
    async getByToken(token: string) {
        const invitation = await prisma.invitation.findUnique({
            where: { token },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!invitation) {
            throw new Error('Undangan tidak ditemukan');
        }

        // Check if expired
        if (invitation.status === 'PENDING' && new Date() > invitation.expiresAt) {
            await prisma.invitation.update({
                where: { id: invitation.id },
                data: { status: 'EXPIRED' },
            });
            invitation.status = 'EXPIRED';
        }

        return invitation;
    }

    // Get invitations by organization
    async getByOrganization(organizationId: number, status?: string) {
        const where: any = { organizationId };
        if (status) {
            where.status = status;
        }

        return prisma.invitation.findMany({
            where,
            include: {
                inviter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Get invitations for a user (by email)
    async getByEmail(email: string) {
        return prisma.invitation.findMany({
            where: {
                email,
                status: 'PENDING',
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                    },
                },
                inviter: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Accept invitation
    async accept(token: string, userId: number) {
        const invitation = await this.getByToken(token);

        if (invitation.status !== 'PENDING') {
            throw new Error(`Undangan sudah ${invitation.status.toLowerCase()}`);
        }

        if (new Date() > invitation.expiresAt) {
            await prisma.invitation.update({
                where: { id: invitation.id },
                data: { status: 'EXPIRED' },
            });
            throw new Error('Undangan sudah kadaluarsa');
        }

        // Get user to verify email matches
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User tidak ditemukan');
        }

        if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
            throw new Error('Email tidak cocok dengan undangan');
        }

        // Check if already a member
        const existingMembership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId: invitation.organizationId,
                },
            },
        });

        if (existingMembership) {
            // Update invitation status but don't create membership
            await prisma.invitation.update({
                where: { id: invitation.id },
                data: { status: 'ACCEPTED' },
            });
            throw new Error('Anda sudah menjadi member organisasi ini');
        }

        // Transaction: update invitation and create membership
        const [updatedInvitation, membership] = await prisma.$transaction([
            prisma.invitation.update({
                where: { id: invitation.id },
                data: { status: 'ACCEPTED' },
            }),
            prisma.organizationMember.create({
                data: {
                    userId,
                    organizationId: invitation.organizationId,
                    role: invitation.role,
                    isDefault: false,
                },
                include: {
                    organization: true,
                },
            }),
        ]);

        return { invitation: updatedInvitation, membership };
    }

    // Decline invitation
    async decline(token: string) {
        const invitation = await this.getByToken(token);

        if (invitation.status !== 'PENDING') {
            throw new Error(`Undangan sudah ${invitation.status.toLowerCase()}`);
        }

        return prisma.invitation.update({
            where: { id: invitation.id },
            data: { status: 'DECLINED' },
        });
    }

    // Cancel invitation (by admin/owner)
    async cancel(id: number, organizationId: number) {
        const invitation = await prisma.invitation.findFirst({
            where: { id, organizationId },
        });

        if (!invitation) {
            throw new Error('Undangan tidak ditemukan');
        }

        if (invitation.status !== 'PENDING') {
            throw new Error('Hanya undangan pending yang bisa dibatalkan');
        }

        return prisma.invitation.delete({
            where: { id },
        });
    }

    // Resend invitation (generate new token and extend expiry)
    async resend(id: number, organizationId: number) {
        const invitation = await prisma.invitation.findFirst({
            where: { id, organizationId, status: 'PENDING' },
        });

        if (!invitation) {
            throw new Error('Undangan tidak ditemukan atau sudah tidak pending');
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        return prisma.invitation.update({
            where: { id },
            data: {
                token: this.generateToken(),
                expiresAt,
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                inviter: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    // Cleanup expired invitations
    async cleanupExpired() {
        return prisma.invitation.updateMany({
            where: {
                status: 'PENDING',
                expiresAt: {
                    lt: new Date(),
                },
            },
            data: { status: 'EXPIRED' },
        });
    }
}

export default new InvitationService();
