import { prisma } from '../../shared/config/prismaClient';
import { RegisterDto } from './auth.validation';
import { Role } from '../../generated/prisma';

export class AuthRepository {
  findUserByEmail = async (email: string, role?: Role) => {
    return prisma.user.findFirst({
      where: {
        email,
        ...(role ? { role } : {})
      },
      include: {
        company: true,
        profile: {
          include: {
            company: true,
            school: true,
          },
        },
        cvDocuments: {
          where: { isActive: true },
          include: {
            extractedSkills: {
              include: { skill: true }
            }
          }
        }
      }
    });
  };

  findUserById = async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
        profile: {
          include: {
            company: true,
            school: true
          }
        },
        cvDocuments: {
          where: { isActive: true },
          include: {
            extractedSkills: {
              include: { skill: true }
            }
          }
        } 
      }
    });
  };

  createUser = async (data: RegisterDto, passwordHash: string) => {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
          }
        }
      },
      include: {
        company: true,
        profile: {
          include: {
            company: true,
            school: true,
          },
        },
      }
    });
  };

  saveRefreshToken = async (userId: string, tokenHash: string, expiresAt: Date) => {
    return prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      }
    });
  };

  findRefreshToken = async (tokenHash: string) => {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
  };

  revokeRefreshToken = async (tokenHash: string) => {
    return prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() }
    });
  };

  createAuditLog = async (actorId: string | null, action: string, metadata: any = {}, entityId?: string) => {
    return prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType: 'USER',
        entityId,
        metadata
      }
    });
  };
}
