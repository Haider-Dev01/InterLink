import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';

const router = Router();
const adminController = new AdminController();

// All admin routes require admin role
router.use(authenticate, authorize(['admin']));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/ban', adminController.banUser);
router.patch('/users/:id/unban', adminController.unbanUser);

export default router;
