import { PrismaClient } from '@prisma/client';
import { prisma } from '../../shared/config/prismaClient';

export class ApplicationRepository {
  async create(data: { candidateId: string; offerId: string; coverLetter?: string }) {
    return prisma.application.create({
      data: {
        candidateId: data.candidateId,
        offerId: data.offerId,
        coverLetter: data.coverLetter,
      },
      include: {
        offer: {
          select: {
            id: true, title: true, location: true, remote: true,
            offerStatus: true, company: true
          }
        }
      }
    });
  }

  async findByCandidate(candidateId: string) {
    return prisma.application.findMany({
      where: { candidateId },
      include: {
        candidate: {
          include: {
            match_scores: true
          }
        },
        offer: {
          select: {
            id: true, title: true, location: true, remote: true,
            offerStatus: true, company: true
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async findByOffer(offerId: string) {
    return prisma.application.findMany({
      where: { offerId },
      include: {
        candidate: {
          include: {
            profile: true,
            cvDocuments: {
              where: { isActive: true },
              select: {
                id: true, fileUrl: true, isActive: true, parseStatus: true,
                extractedSkills: { include: { skill: true } }
              },
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            match_scores: {
              where: { offerId }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async findByRecruiter(recruiterId: string, offerId?: string) {
    return prisma.application.findMany({
      where: {
        ...(offerId ? { offerId } : {}),
        offer: {
          recruiterId,
          deletedAt: null,
        },
      },
      include: {
        candidate: {
          include: {
            profile: true,
            cvDocuments: {
              where: { isActive: true },
              select: {
                id: true, fileUrl: true, isActive: true, parseStatus: true,
                extractedSkills: { include: { skill: true } }
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            match_scores: true,
          },
        },
        offer: {
          select: {
            id: true, title: true, location: true, remote: true,
            offerStatus: true, company: true
          }
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });
  }

  async updateStatus(id: string, status: any) {
    return prisma.application.update({
      where: { id },
      data: { applicationStatus: status }
    });
  }

  async findById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        candidate: {
          include: {
            profile: true
          }
        },
        offer: {
          select: {
            id: true, title: true, location: true, remote: true,
            offerStatus: true, recruiterId: true, companyId: true, company: true
          }
        }
      }
    });
  }
}

export const applicationRepository = new ApplicationRepository();
