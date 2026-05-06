import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { prisma } from '../../shared/config/prismaClient';
import { RegisterDto, LoginDto } from './auth.validation';
import { env } from '../../shared/config/env';
import { AppError } from '../../shared/errors/AppError';

const authRepository = new AuthRepository();

export class AuthService {
  private readonly validRoles = new Set(['candidate', 'recruiter', 'admin']);

  register = async (data: RegisterDto) => {
    try {
      const existingUser = await authRepository.findUserByEmail(data.email);
      if (existingUser) {
        throw new AppError('Cet email est déjà utilisé', 400);
      }

      const passwordHash = await bcrypt.hash(data.password, 12);

      // Utilisation d'une transaction pour garantir l'atomicité
      const result = await prisma.$transaction(async (tx: any) => {
        let companyId: string | undefined;

        if ((data.role as any) === 'admin') {
          throw new AppError('La création de compte administrateur est interdite via ce formulaire', 403);
        }

        if (data.role === 'recruiter') {
          const domain = data.email.split('@')[1];
          if (!domain) throw new AppError('Email invalide', 400);

          const companySearchName = domain.split('.')[0]; // ex: techgo
          const company = await tx.company.findFirst({
            where: {
              name: { equals: companySearchName, mode: 'insensitive' }
            }
          });

          if (!company) {
            throw new AppError(`Accès refusé : L'entreprise correspondant au domaine @${domain} n'est pas enregistrée sur InternLink.`, 400);
          }
          companyId = company.id;
        }

        // 1. Création de l'utilisateur et de son profil
        const user = await tx.user.create({
          data: {
            email: data.email,
            passwordHash,
            role: data.role,
            companyId: companyId,
            profile: {
              create: {
                firstName: data.firstName,
                lastName: data.lastName,
                companyId: companyId
              }
            }
          },
          include: { profile: true }
        });

        // 2. Génération des tokens (avec sauvegarde du refresh token dans la transaction)
        const tokens = await this.generateTokens(user.id, user.email, user.role as any, tx);

        const hydratedUser = await tx.user.findUnique({
          where: { id: user.id },
          include: {
            company: true,
            profile: {
              include: {
                company: true,
                school: true,
              },
            },
          },
        });

        // 3. Log d'audit
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            action: 'USER_REGISTERED',
            entityType: 'USER',
            entityId: user.id,
            metadata: { email: user.email }
          }
        });

        return { user: this.transformUser(hydratedUser ?? user), ...tokens };
      });

      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      console.error('[AuthService.register] Error:', error);
      throw new AppError(
        error instanceof Error ? error.message : 'Erreur lors de l\'inscription',
        500
      );
    }
  };

  async login(data: LoginDto) {
    try {
      if (!this.validRoles.has(data.role)) {
        throw new AppError('Role invalide', 400);
      }

      const user = await authRepository.findUserByEmail(data.email, data.role);
      if (!user) {
        throw new AppError('Identifiants invalides', 401);
      }

      if (!this.validRoles.has((user.role || '').toLowerCase())) {
        throw new AppError('Role utilisateur invalide', 403);
      }

      if (user.isBanned) {
        throw new AppError('Ce compte a été suspendu', 403);
      }

      const isMatch = await bcrypt.compare(data.password, user.passwordHash);
      if (!isMatch) {
        throw new AppError('Identifiants invalides', 401);
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role as any);

      await authRepository.createAuditLog(user.id, 'USER_LOGGED_IN');

      return { user: this.transformUser(user), ...tokens };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error instanceof Error ? error.message : 'Erreur lors de la connexion',
        500
      );
    }
  }

  async refresh(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new AppError('Refresh token manquant', 401);
      }

      const tokenHash = this.hashToken(refreshToken);
      const storedToken = await authRepository.findRefreshToken(tokenHash);

      if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
        throw new AppError('Token de rafraîchissement invalide ou expiré', 401);
      }

      const user = storedToken.user;
      const tokens = await this.generateTokens(user.id, user.email, user.role as any);

      return tokens;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error instanceof Error ? error.message : 'Erreur lors du rafraîchissement du token',
        500
      );
    }
  }

  async logout(refreshToken: string) {
    try {
      if (refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        await authRepository.revokeRefreshToken(tokenHash);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error instanceof Error ? error.message : 'Erreur lors de la déconnexion',
        500
      );
    }
  }

  async getMe(userId: string) {
    try {
      const user = await authRepository.findUserById(userId);
      if (!user) {
        throw new AppError('Utilisateur introuvable', 404);
      }
      return this.transformUser(user);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        error instanceof Error ? error.message : 'Erreur lors de la récupération de l\'utilisateur',
        500
      );
    }
  }

  private transformUser(user: any) {
    if (!user) return null;
    
    // Extraire les skills du CV actif
    const activeCv = user.cvDocuments?.[0];
    const skills = activeCv?.extractedSkills?.map((es: any) => ({
      id: es.skill.id,
      name: es.skill.name
    })) || [];

    const { cvDocuments, ...userWithoutCvs } = user;
    return {
      ...userWithoutCvs,
      skills
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateTokens = async (userId: string, email: string, role: string, tx?: any) => {
    const accessToken = jwt.sign(
      { userId, email, role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const refreshTokenRaw = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = this.hashToken(refreshTokenRaw);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    if (tx) {
      await tx.refreshToken.create({
        data: {
          userId,
          tokenHash: refreshTokenHash,
          expiresAt,
        }
      });
    } else {
      await authRepository.saveRefreshToken(userId, refreshTokenHash, expiresAt);
    }

    return { accessToken, refreshToken: refreshTokenRaw };
  };
}
