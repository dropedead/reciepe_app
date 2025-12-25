import { Request, Response, NextFunction } from 'express';
import organizationService from '../services/organizationService';

// Extend Express Request type to include organizationId
declare global {
    namespace Express {
        interface Request {
            organizationId?: number;
            organizationRole?: string;
        }
    }
}

/**
 * Tenant middleware - extracts organization context from request
 * Uses X-Organization-Id header to determine current organization
 * Falls back to user's default organization if header not provided
 */
export const tenantContext = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // User must be authenticated first
        if (!req.user) {
            return res.status(401).json({ error: 'Autentikasi diperlukan' });
        }

        // Get organization ID from header
        const orgIdHeader = req.headers['x-organization-id'];
        let organizationId: number | null = null;

        if (orgIdHeader) {
            organizationId = parseInt(orgIdHeader as string, 10);
            if (isNaN(organizationId)) {
                return res.status(400).json({ error: 'X-Organization-Id header tidak valid' });
            }
        } else {
            // Fall back to user's default organization
            const defaultOrg = await organizationService.getUserDefaultOrganization(req.user.id);
            if (defaultOrg) {
                organizationId = defaultOrg.id;
            }
        }

        // If no organization found, user needs to create or join one
        if (!organizationId) {
            return res.status(400).json({
                error: 'Organisasi tidak ditemukan. Silakan buat atau bergabung dengan organisasi terlebih dahulu.',
                code: 'NO_ORGANIZATION'
            });
        }

        // Verify user is member of this organization
        const isMember = await organizationService.isMember(req.user.id, organizationId);
        if (!isMember) {
            return res.status(403).json({
                error: 'Anda tidak memiliki akses ke organisasi ini',
                code: 'NOT_A_MEMBER'
            });
        }

        // Get user's role in organization
        const role = await organizationService.getUserRole(req.user.id, organizationId);

        // Attach organization context to request
        req.organizationId = organizationId;
        req.organizationRole = role || undefined;

        next();
    } catch (error) {
        console.error('Tenant middleware error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses konteks organisasi' });
    }
};

/**
 * Require specific organization roles
 */
export const requireOrgRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.organizationRole) {
            return res.status(403).json({ error: 'Role organisasi tidak ditemukan' });
        }

        if (!allowedRoles.includes(req.organizationRole)) {
            return res.status(403).json({
                error: 'Anda tidak memiliki akses untuk melakukan aksi ini di organisasi ini'
            });
        }

        next();
    };
};

/**
 * Optional tenant context - doesn't fail if no organization
 * Useful for endpoints that can work without organization context
 */
export const optionalTenantContext = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next();
        }

        const orgIdHeader = req.headers['x-organization-id'];

        if (orgIdHeader) {
            const organizationId = parseInt(orgIdHeader as string, 10);
            if (!isNaN(organizationId)) {
                const isMember = await organizationService.isMember(req.user.id, organizationId);
                if (isMember) {
                    const role = await organizationService.getUserRole(req.user.id, organizationId);
                    req.organizationId = organizationId;
                    req.organizationRole = role || undefined;
                }
            }
        } else {
            // Try to get default organization
            const defaultOrg = await organizationService.getUserDefaultOrganization(req.user.id);
            if (defaultOrg) {
                const role = await organizationService.getUserRole(req.user.id, defaultOrg.id);
                req.organizationId = defaultOrg.id;
                req.organizationRole = role || undefined;
            }
        }

        next();
    } catch {
        // Don't fail on errors for optional context
        next();
    }
};
