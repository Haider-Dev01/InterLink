import { prisma } from '../../shared/config/prismaClient';
import { RegisterCompanyDto } from './company.validation';

export class CompanyRepository {
  async findCompanyByUserId(userId: string) {
    return prisma.company.findUnique({
      where: { userId }
    });
  }

  async createCompany(userId: string, data: RegisterCompanyDto) {
    const company = await prisma.$transaction(async (tx) => {
      // Create company
      const newCompany = await tx.company.create({
        data: {
          userId,
          name: data.name,
          industry: data.industry,
          siteWeb: data.siteWeb,
          isVerified: false,
        }
      });

      // Update profile
      await tx.profile.update({
        where: { userId },
        data: { companyId: newCompany.id }
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: 'COMPANY_REGISTERED',
          entityType: 'company',
          entityId: newCompany.id,
        }
      });

      return newCompany;
    });

    return company;
  }

  async findPendingCompanies() {
    return prisma.company.findMany({
      where: {
        isVerified: false,
        isRejected: false,
        deletedAt: null,
      }
    });
  }

  async findCompanyById(companyId: string) {
    return prisma.company.findUnique({
      where: { id: companyId },
      include: {
        jobOffers: {
          where: { offerStatus: 'published', deletedAt: null }
        }
      }
    });
  }

  async verifyCompany(adminId: string, companyId: string) {
    return prisma.$transaction(async (tx) => {
      const company = await tx.company.update({
        where: { id: companyId },
        data: {
          isVerified: true,
          validatedAt: new Date(),
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: 'COMPANY_VERIFIED',
          entityType: 'company',
          entityId: companyId,
        }
      });

      return company;
    });
  }

  async rejectCompany(adminId: string, companyId: string, reason: string) {
    return prisma.$transaction(async (tx) => {
      const company = await tx.company.update({
        where: { id: companyId },
        data: {
          isRejected: true,
          rejectedReason: reason,
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: 'COMPANY_REJECTED',
          entityType: 'company',
          entityId: companyId,
          metadata: { reason }
        }
      });

      return company;
    });
  }
}
