import { Router } from 'express';
import categoryRoutes from './categoryRoutes';
import ingredientRoutes from './ingredientRoutes';
import recipeRoutes from './recipeRoutes';
import menuRoutes from './menuRoutes';
import statsRoutes from './statsRoutes';
import unitRoutes from './unitRoutes';
import priceHistoryRoutes from './priceHistoryRoutes';
import unitMasterRoutes from './unitMasterRoutes';
import recipeCategoryRoutes from './recipeCategoryRoutes';
import menuCategoryRoutes from './menuCategoryRoutes';
import authRoutes from './authRoutes';
import organizationRoutes from './organizationRoutes';
import invitationRoutes from './invitationRoutes';
import bundlingRoutes from './bundlingRoutes';
import notificationRoutes from './notificationRoutes';

const router = Router();

// Auth routes (no tenant context needed)
router.use('/auth', authRoutes);

// Organization routes (authenticated but no tenant context needed)
router.use('/organizations', organizationRoutes);

// Invitation routes (mixed - some public, some need auth/tenant)
router.use('/invitations', invitationRoutes);

// Notification routes (authenticated, no tenant context)
router.use('/notifications', notificationRoutes);

// Tenant-scoped routes
router.use('/categories', categoryRoutes);
router.use('/ingredients', ingredientRoutes);
router.use('/recipes', recipeRoutes);
router.use('/menus', menuRoutes);
router.use('/stats', statsRoutes);
router.use('/units', unitRoutes);
router.use('/price-history', priceHistoryRoutes);
router.use('/unit-master', unitMasterRoutes);
router.use('/recipe-categories', recipeCategoryRoutes);
router.use('/menu-categories', menuCategoryRoutes);
router.use('/bundling', bundlingRoutes);

export default router;


