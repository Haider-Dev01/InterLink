import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate';
import { notificationController } from './notification.controller';

const router = Router();

// Routes statiques AVANT /:id
router.get('/unread-count', authenticate, notificationController.getUnreadCount);
router.patch('/read-all', authenticate, notificationController.markAllAsRead);
router.get('/', authenticate, notificationController.getNotifications);
router.patch('/:id/read', authenticate, notificationController.markAsRead);

export default router;
