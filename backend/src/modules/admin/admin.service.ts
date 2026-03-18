import { AdminRepository } from './admin.repository';
import { AppError } from '../../shared/middleware/errorHandler';

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

  async getStats() {
    return adminRepository.getStats();
  }
}
