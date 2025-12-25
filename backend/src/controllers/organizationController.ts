import { Request, Response } from 'express';
import organizationService from '../services/organizationService';

// Create organization
export const createOrganization = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { name, slug, description, logoUrl } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Nama organisasi wajib diisi' });
        }

        const organization = await organizationService.create(
            { name, slug, description, logoUrl },
            req.user.id
        );

        res.status(201).json(organization);
    } catch (error) {
        console.error('Error creating organization:', error);
        res.status(500).json({ error: 'Gagal membuat organisasi' });
    }
};

// Get user's organizations
export const getUserOrganizations = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const organizations = await organizationService.getUserOrganizations(req.user.id);
        res.json(organizations);
    } catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({ error: 'Gagal mengambil daftar organisasi' });
    }
};

// Get organization by ID
export const getOrganizationById = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const id = parseInt(req.params.id);

        // Verify user is member
        const isMember = await organizationService.isMember(req.user.id, id);
        if (!isMember) {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke organisasi ini' });
        }

        const organization = await organizationService.getById(id);

        if (!organization) {
            return res.status(404).json({ error: 'Organisasi tidak ditemukan' });
        }

        res.json(organization);
    } catch (error) {
        console.error('Error fetching organization:', error);
        res.status(500).json({ error: 'Gagal mengambil detail organisasi' });
    }
};

// Update organization
export const updateOrganization = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const id = parseInt(req.params.id);

        // Verify user is OWNER or ADMIN
        const role = await organizationService.getUserRole(req.user.id, id);
        if (!role || !['OWNER', 'ADMIN'].includes(role)) {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk mengubah organisasi ini' });
        }

        const { name, description, logoUrl, isActive } = req.body;

        const organization = await organizationService.update(id, {
            name,
            description,
            logoUrl,
            isActive,
        });

        res.json(organization);
    } catch (error) {
        console.error('Error updating organization:', error);
        res.status(500).json({ error: 'Gagal mengupdate organisasi' });
    }
};

// Delete organization
export const deleteOrganization = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const id = parseInt(req.params.id);

        // Only OWNER can delete
        const role = await organizationService.getUserRole(req.user.id, id);
        if (role !== 'OWNER') {
            return res.status(403).json({ error: 'Hanya owner yang dapat menghapus organisasi' });
        }

        await organizationService.delete(id);
        res.json({ message: 'Organisasi berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting organization:', error);
        res.status(500).json({ error: 'Gagal menghapus organisasi' });
    }
};

// Get organization members
export const getMembers = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const id = parseInt(req.params.id);

        // Verify user is member
        const isMember = await organizationService.isMember(req.user.id, id);
        if (!isMember) {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke organisasi ini' });
        }

        const members = await organizationService.getMembers(id);
        res.json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Gagal mengambil daftar member' });
    }
};

// Add member to organization
export const addMember = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const id = parseInt(req.params.id);

        // Verify user is OWNER or ADMIN
        const role = await organizationService.getUserRole(req.user.id, id);
        if (!role || !['OWNER', 'ADMIN'].includes(role)) {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk menambah member' });
        }

        const { email, role: memberRole } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email wajib diisi' });
        }

        const member = await organizationService.addMember(id, { email, role: memberRole });
        res.status(201).json(member);
    } catch (error) {
        console.error('Error adding member:', error);
        const message = error instanceof Error ? error.message : 'Gagal menambah member';
        res.status(400).json({ error: message });
    }
};

// Remove member from organization
export const removeMember = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const organizationId = parseInt(req.params.id);
        const userId = parseInt(req.params.userId);

        // Verify user is OWNER or ADMIN, or removing self
        const role = await organizationService.getUserRole(req.user.id, organizationId);
        const isSelf = req.user.id === userId;

        if (!isSelf && (!role || !['OWNER', 'ADMIN'].includes(role))) {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk menghapus member' });
        }

        await organizationService.removeMember(organizationId, userId);
        res.json({ message: 'Member berhasil dihapus' });
    } catch (error) {
        console.error('Error removing member:', error);
        const message = error instanceof Error ? error.message : 'Gagal menghapus member';
        res.status(400).json({ error: message });
    }
};

// Update member role
export const updateMemberRole = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const organizationId = parseInt(req.params.id);
        const userId = parseInt(req.params.userId);

        // Only OWNER can change roles
        const role = await organizationService.getUserRole(req.user.id, organizationId);
        if (role !== 'OWNER') {
            return res.status(403).json({ error: 'Hanya owner yang dapat mengubah role member' });
        }

        const { role: newRole } = req.body;

        if (!newRole) {
            return res.status(400).json({ error: 'Role wajib diisi' });
        }

        const member = await organizationService.updateMemberRole(organizationId, userId, newRole);
        res.json(member);
    } catch (error) {
        console.error('Error updating member role:', error);
        const message = error instanceof Error ? error.message : 'Gagal mengubah role member';
        res.status(400).json({ error: message });
    }
};

// Set default organization
export const setDefaultOrganization = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const id = parseInt(req.params.id);

        const membership = await organizationService.setDefaultOrganization(req.user.id, id);
        res.json(membership);
    } catch (error) {
        console.error('Error setting default organization:', error);
        const message = error instanceof Error ? error.message : 'Gagal mengatur organisasi default';
        res.status(400).json({ error: message });
    }
};
