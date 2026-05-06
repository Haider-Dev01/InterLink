import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';

const adminService = new AdminService();

export class AdminController {
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const role = req.query.role as string | undefined;

      const { users, total, totalBanned } = await adminService.getUsers(page, limit, role);

      res.status(200).json({
        success: true,
        data: { users, total, totalBanned, page, limit }
      });
    } catch (error) {
      next(error);
    }
  };

  getOffers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);

      const { offers, total } = await adminService.getOffers(page, limit);

      res.status(200).json({
        success: true,
        data: { offers, total, page, limit }
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

  getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const analytics = await adminService.getDetailedAnalytics();

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  };

  getPendingCompanies = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companies = await adminService.getPendingCompanies();
      res.status(200).json({ success: true, data: companies });
    } catch (error) {
      next(error);
    }
  };

  verifyCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user!.id;
      const companyId = req.params.id as string;
      await adminService.verifyCompany(companyId, adminId);
      res.status(200).json({ success: true, message: 'Entreprise vérifiée avec succès' });
    } catch (error) {
      next(error);
    }
  };

  rejectCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user!.id;
      const companyId = req.params.id as string;
      const { reason } = req.body;
      await adminService.rejectCompany(companyId, reason, adminId);
      res.status(200).json({ success: true, message: 'Entreprise rejetée' });
    } catch (error) {
      next(error);
    }
  };

  toggleOfferFeatured = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { isFeatured } = req.body;
      await adminService.toggleOfferFeatured(id, isFeatured);
      res.status(200).json({ success: true, message: 'Statut mis en avant mis à jour' });
    } catch (error) {
      next(error);
    }
  };

  updateOfferStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      
      if (status === 'deleted') {
        await adminService.deleteOffer(id);
        res.status(200).json({ success: true, message: 'Offre supprimée avec succès' });
      } else {
        await adminService.updateOfferStatus(id, status);
        res.status(200).json({ success: true, message: 'Statut de l\'offre mis à jour' });
      }
    } catch (error) {
      next(error);
    }
  };

  getUserAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const logs = await adminService.getUserAuditLogs(id);
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  };
}
