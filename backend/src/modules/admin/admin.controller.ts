import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';

const adminService = new AdminService();

export class AdminController {
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const role = req.query.role as string | undefined;

      const { users, total } = await adminService.getUsers(page, limit, role);

      res.status(200).json({
        success: true,
        data: { users, total, page, limit }
      });
    } catch (error) {
      next(error);
    }
  };

  banUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user!.id;
      const userId = req.params.id as string;

      await adminService.banUser(adminId, userId);

      res.status(200).json({
        success: true,
        message: 'Utilisateur banni avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  unbanUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user!.id;
      const userId = req.params.id as string;

      await adminService.unbanUser(adminId, userId);

      res.status(200).json({
        success: true,
        message: 'Utilisateur débanni avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await adminService.getStats();

      res.status(200).json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  };
}
