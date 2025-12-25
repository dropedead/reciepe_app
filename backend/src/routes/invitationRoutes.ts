import { Router } from 'express';
import invitationController from '../controllers/invitationController';
import { authenticate } from '../middleware/auth';
import { tenantContext } from '../middleware/tenantMiddleware';

const router = Router();

// Public routes (for viewing/accepting invitations)
router.get('/token/:token', invitationController.getByToken);
router.post('/token/:token/decline', invitationController.decline);

// Protected routes (need auth)
router.use(authenticate);

// Get my pending invitations (across all orgs)
router.get('/my', invitationController.getMyInvitations);

// Accept invitation (need to be logged in)
router.post('/token/:token/accept', invitationController.accept);

// Organization-scoped routes (need auth + tenant)
router.use(tenantContext);

// CRUD for organization invitations
router.post('/', invitationController.create);
router.get('/', invitationController.getAll);
router.delete('/:id', invitationController.cancel);
router.post('/:id/resend', invitationController.resend);

export default router;
