import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    createOrganization,
    getUserOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
    getMembers,
    addMember,
    removeMember,
    updateMemberRole,
    setDefaultOrganization,
} from '../controllers/organizationController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Organization CRUD
router.post('/', createOrganization);
router.get('/', getUserOrganizations);
router.get('/:id', getOrganizationById);
router.put('/:id', updateOrganization);
router.delete('/:id', deleteOrganization);

// Set default organization
router.post('/:id/default', setDefaultOrganization);

// Member management
router.get('/:id/members', getMembers);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.put('/:id/members/:userId', updateMemberRole);

export default router;
