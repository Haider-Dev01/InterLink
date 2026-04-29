import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate';
import { prisma } from '../../shared/config/prismaClient';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return res.status(200).json({
      success: true,
      data: { notifications, unreadCount },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const notificationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });

    if (!result.count) {
      return res.status(404).json({ success: false, message: 'Notification introuvable' });
    }

    return res.status(200).json({ success: true, message: 'Notification marquée comme lue' });
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return res.status(200).json({ success: true, message: 'Toutes les notifications sont lues' });
  } catch (error) {
    next(error);
  }
});

export default router;
