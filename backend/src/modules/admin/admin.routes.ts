import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';

const router = Router();
const adminController = new AdminController();

// All admin routes require admin role
router.use(authenticate, authorize(['admin']));

router.get('/stats', adminController.getStats);
router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getUsers);
router.get('/offers', adminController.getOffers);
router.patch('/users/:id/ban', adminController.banUser);
router.patch('/users/:id/unban', adminController.unbanUser);
router.get('/companies/pending', adminController.getPendingCompanies);
router.patch('/companies/:id/verify', adminController.verifyCompany);
router.patch('/companies/:id/reject', adminController.rejectCompany);
router.patch('/offers/:id/featured', adminController.toggleOfferFeatured);
router.patch('/offers/:id/status', adminController.updateOfferStatus);
router.get('/users/:id/logs', adminController.getUserAuditLogs);

export default router;
