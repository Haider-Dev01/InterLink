import { prisma } from '../../shared/config/prismaClient';

export class AdminRepository {
  async getUsers(page: number, limit: number, role?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (role) {
      whereClause.role = role;
    }

    const [users, total, totalBanned] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: { 
          profile: {
            include: {
              school: true,
              company: true
            }
          },
          match_scores: {
            orderBy: { computedAt: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereClause }),
      prisma.user.count({ where: { isBanned: true } })
    ]);

    return { users, total, totalBanned };
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

  async getOffers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [offers, total] = await Promise.all([
      prisma.jobOffer.findMany({
        skip,
        take: limit,
        select: {
          id: true, title: true, offerStatus: true, location: true, 
          durationMonths: true, remote: true, isFeatured: true,
          createdAt: true, updatedAt: true, deletedAt: true,
          company: true,
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.jobOffer.count()
    ]);

    return { offers, total };
  }

  async getStats() {
    const [
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalCompanies,
      pendingCompanies,
      totalOffers,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'candidate' } }),
      prisma.user.count({ where: { role: 'recruiter' } }),
      prisma.company.count(),
      prisma.company.count({ where: { isVerified: false, isRejected: false, deletedAt: null } }),
      prisma.jobOffer.count({ where: { offerStatus: 'published', deletedAt: null } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { 
          profile: {
            include: {
              school: true,
              company: true
            }
          }
        }
      })
    ]);

    return {
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalCompanies,
      pendingCompanies,
      totalOffers,
      recentUsers
    };
  }

  async getDetailedAnalytics() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      matchingDistribution,
      userGrowth,
      applicationTrends
    ] = await Promise.all([
      // Distribution des scores
      Promise.all([
        prisma.matchScore.count({ where: { scoreFinal: { gte: 0.75 } } }),
        prisma.matchScore.count({ where: { scoreFinal: { gte: 0.5, lt: 0.75 } } }),
        prisma.matchScore.count({ where: { scoreFinal: { gte: 0.25, lt: 0.5 } } }),
        prisma.matchScore.count({ where: { scoreFinal: { lt: 0.25 } } }),
      ]),
      // Croissance des utilisateurs (simplifié par mois)
      prisma.$queryRaw`
        SELECT 
          TO_CHAR("createdAt", 'Mon') as month,
          COUNT(*) FILTER (WHERE role = 'candidate') as candidats,
          COUNT(*) FILTER (WHERE role = 'recruiter') as recruteurs
        FROM users
        WHERE "createdAt" >= ${sixMonthsAgo}
        GROUP BY month, DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt")
        LIMIT 6
      `,
      // Tendances des candidatures
      prisma.$queryRaw`
        SELECT 
          TO_CHAR("appliedAt", 'Mon') as month,
          COUNT(*) as applications
        FROM applications
        WHERE "appliedAt" >= ${sixMonthsAgo}
        GROUP BY month, DATE_TRUNC('month', "appliedAt")
        ORDER BY DATE_TRUNC('month', "appliedAt")
        LIMIT 6
      `
    ]);

    const distributionLabels = ['Excellent', 'Bon', 'Moyen', 'Faible'];
    const formattedDistribution = matchingDistribution.map((value, i) => ({
      name: distributionLabels[i],
      value
    }));

    return {
      matchingDistribution: formattedDistribution,
      userGrowth,
      applicationTrends
    };
  }

  async getPendingCompanies() {
    return prisma.company.findMany({
      where: { isVerified: false, isRejected: false, deletedAt: null },
      include: {
        user: {
          include: { profile: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async verifyCompany(companyId: string, adminId: string) {
    return prisma.$transaction(async (tx) => {
      const company = await tx.company.update({
        where: { id: companyId },
        data: { isVerified: true, validatedAt: new Date() }
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: 'COMPANY_VERIFIED',
          entityType: 'COMPANY',
          entityId: companyId
        }
      });

      return company;
    });
  }

  async rejectCompany(companyId: string, reason: string, adminId: string) {
    return prisma.$transaction(async (tx) => {
      const company = await tx.company.update({
        where: { id: companyId },
        data: { isRejected: true, rejectedReason: reason }
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: 'COMPANY_REJECTED',
          entityType: 'COMPANY',
          entityId: companyId,
          metadata: { reason }
        }
      });

      return company;
    });
  }

  async toggleOfferFeatured(offerId: string, isFeatured: boolean) {
    return prisma.jobOffer.update({
      where: { id: offerId },
      data: { isFeatured },
      select: { id: true, isFeatured: true }
    });
  }

  async updateOfferStatus(offerId: string, status: any) {
    return prisma.jobOffer.update({
      where: { id: offerId },
      data: { 
        offerStatus: status,
        publishedAt: status === 'published' ? new Date() : undefined,
        deletedAt: null // Restore if it was deleted
      },
      select: { id: true, offerStatus: true, publishedAt: true }
    });
  }

  async deleteOffer(offerId: string) {
    return prisma.jobOffer.update({
      where: { id: offerId },
      data: { deletedAt: new Date() }
    });
  }

  async getUserAuditLogs(userId: string) {
    return prisma.auditLog.findMany({
      where: {
        OR: [
          { actorId: userId },
          { entityId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }
}
