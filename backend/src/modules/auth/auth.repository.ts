import { prisma } from '../../shared/config/prismaClient';
import { RegisterDto } from './auth.validation';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });
  }

  async createUser(data: RegisterDto, passwordHash: string) {
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
      include: { profile: true }
    });
  }

  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      }
    });
  }

  async findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
  }

  async revokeRefreshToken(tokenHash: string) {
    return prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() }
    });
  }

  async createAuditLog(actorId: string | null, action: string, metadata: any = {}) {
    return prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType: 'USER',
        metadata
      }
    });
  }
}
