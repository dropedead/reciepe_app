import { Request, Response } from 'express';
import invitationService from '../services/invitationService';
import organizationService from '../services/organizationService';

// Use Express.Request directly since it's already extended in auth middleware

class InvitationController {
    // Create invitation
    async create(req: Request, res: Response) {
        try {
            const { email, role } = req.body;
            const organizationId = req.organizationId;
            const invitedBy = req.user?.id;

            if (!organizationId) {
                return res.status(400).json({ error: 'Organization ID diperlukan' });
            }

            if (!invitedBy) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (!email) {
                return res.status(400).json({ error: 'Email diperlukan' });
            }

            // Check if user has permission (OWNER or ADMIN)
            const userRole = await organizationService.getUserRole(invitedBy, organizationId);
            if (!userRole || !['OWNER', 'ADMIN'].includes(userRole)) {
                return res.status(403).json({ error: 'Anda tidak memiliki izin untuk mengundang member' });
            }

            const invitation = await invitationService.create({
                email,
                organizationId,
                role: role || 'MEMBER',
                invitedBy,
            });

            res.status(201).json(invitation);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Get all invitations for organization
    async getAll(req: Request, res: Response) {
        try {
            const organizationId = req.organizationId;
            const { status } = req.query;

            if (!organizationId) {
                return res.status(400).json({ error: 'Organization ID diperlukan' });
            }

            const invitations = await invitationService.getByOrganization(
                organizationId,
                status as string
            );

            res.json(invitations);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Get invitation by token (public - for accepting)
    async getByToken(req: Request, res: Response) {
        try {
            const { token } = req.params;
            const invitation = await invitationService.getByToken(token);
            res.json(invitation);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    // Get pending invitations for current user
    async getMyInvitations(req: Request, res: Response) {
        try {
            const userEmail = req.user?.email;

            if (!userEmail) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const invitations = await invitationService.getByEmail(userEmail);
            res.json(invitations);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Accept invitation
    async accept(req: Request, res: Response) {
        try {
            const { token } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Anda harus login untuk menerima undangan' });
            }

            const result = await invitationService.accept(token, userId);
            res.json({
                message: 'Undangan diterima',
                organization: result.membership.organization,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Decline invitation
    async decline(req: Request, res: Response) {
        try {
            const { token } = req.params;
            await invitationService.decline(token);
            res.json({ message: 'Undangan ditolak' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Cancel invitation
    async cancel(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const organizationId = req.organizationId;
            const userId = req.user?.id;

            if (!organizationId || !userId) {
                return res.status(400).json({ error: 'Organization ID diperlukan' });
            }

            // Check permission
            const userRole = await organizationService.getUserRole(userId, organizationId);
            if (!userRole || !['OWNER', 'ADMIN'].includes(userRole)) {
                return res.status(403).json({ error: 'Anda tidak memiliki izin' });
            }

            await invitationService.cancel(parseInt(id), organizationId);
            res.json({ message: 'Undangan dibatalkan' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Resend invitation
    async resend(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const organizationId = req.organizationId;
            const userId = req.user?.id;

            if (!organizationId || !userId) {
                return res.status(400).json({ error: 'Organization ID diperlukan' });
            }

            // Check permission
            const userRole = await organizationService.getUserRole(userId, organizationId);
            if (!userRole || !['OWNER', 'ADMIN'].includes(userRole)) {
                return res.status(403).json({ error: 'Anda tidak memiliki izin' });
            }

            const invitation = await invitationService.resend(parseInt(id), organizationId);
            res.json(invitation);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new InvitationController();
