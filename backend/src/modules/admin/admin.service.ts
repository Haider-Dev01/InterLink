import { AdminRepository } from './admin.repository';
import { AppError } from '../../shared/errors/AppError';

const adminRepository = new AdminRepository();

export class AdminService {
  async getUsers(page: number, limit: number, role?: string) {
    return adminRepository.getUsers(page, limit, role);
  }

  async banUser(adminId: string, userId: string) {
    const user = await adminRepository.findUserById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'Utilisateur introuvable' } as AppError;
    }
    if (user.role === 'admin') {
      throw { statusCode: 400, message: 'Impossible de bannir un administrateur' } as AppError;
    }

    await adminRepository.setUserBanStatus(adminId, userId, true);
  }

  async unbanUser(adminId: string, userId: string) {
    const user = await adminRepository.findUserById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'Utilisateur introuvable' } as AppError;
    }

    await adminRepository.setUserBanStatus(adminId, userId, false);
  }

  async getOffers(page: number, limit: number) {
    return adminRepository.getOffers(page, limit);
  }

  async getStats() {
    return adminRepository.getStats();
  }

  async getDetailedAnalytics() {
    return adminRepository.getDetailedAnalytics();
  }

  async getPendingCompanies() {
    return adminRepository.getPendingCompanies();
  }

  async verifyCompany(companyId: string, adminId: string) {
    return adminRepository.verifyCompany(companyId, adminId);
  }

  async rejectCompany(companyId: string, reason: string, adminId: string) {
    return adminRepository.rejectCompany(companyId, reason, adminId);
  }

  async toggleOfferFeatured(offerId: string, isFeatured: boolean) {
    return adminRepository.toggleOfferFeatured(offerId, isFeatured);
  }

  async updateOfferStatus(offerId: string, status: any) {
    return adminRepository.updateOfferStatus(offerId, status);
  }

  async deleteOffer(offerId: string) {
    return adminRepository.deleteOffer(offerId);
  }

  async getUserAuditLogs(userId: string) {
    return adminRepository.getUserAuditLogs(userId);
  }
}
