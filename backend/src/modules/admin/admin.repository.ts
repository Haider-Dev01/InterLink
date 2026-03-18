import { prisma } from '../../shared/config/prismaClient';

export class AdminRepository {
  async getUsers(page: number, limit: number, role?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (role) {
      whereClause.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: { profile: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    return { users, total };
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async setUserBanStatus(adminId: string, userId: string, isBanned: boolean) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { isBanned }
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: isBanned ? 'USER_BANNED' : 'USER_UNBANNED',
          entityType: 'USER',
          entityId: userId
        }
      });

      return user;
    });
  }

  async getStats() {
    const [
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalCompanies,
      pendingCompanies,
      totalOffers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'candidate' } }),
      prisma.user.count({ where: { role: 'recruiter' } }),
      prisma.company.count(),
      prisma.company.count({ where: { isVerified: false, isRejected: false, deletedAt: null } }),
      prisma.jobOffer.count({ where: { offerStatus: 'published', deletedAt: null } })
    ]);

    return {
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalCompanies,
      pendingCompanies,
      totalOffers
    };
  }
}
