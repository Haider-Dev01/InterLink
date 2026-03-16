import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../shared/config/env';
import { AuthRepository } from './auth.repository';
import { RegisterDto, LoginDto } from './auth.validation';
import { AppError } from '../../shared/middleware/errorHandler';

const authRepository = new AuthRepository();

export class AuthService {
  async register(data: RegisterDto) {
    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw { statusCode: 400, message: 'Cet email est déjà utilisé' } as AppError;
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await authRepository.createUser(data, passwordHash);

    const tokens = await this.generateTokens(user.id, user.email, user.role as any);
    
    await authRepository.createAuditLog(user.id, 'USER_REGISTERED', { email: user.email });

    return { user, ...tokens };
  }

  async login(data: LoginDto) {
    const user = await authRepository.findUserByEmail(data.email);
    if (!user) {
      throw { statusCode: 401, message: 'Identifiants invalides' } as AppError;
    }

    if (user.isBanned) {
      throw { statusCode: 403, message: 'Ce compte a été suspendu' } as AppError;
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Identifiants invalides' } as AppError;
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role as any);

    await authRepository.createAuditLog(user.id, 'USER_LOGGED_IN');

    return { user, ...tokens };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw { statusCode: 401, message: 'Refresh token manquant' } as AppError;
    }

    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await authRepository.findRefreshToken(tokenHash);

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw { statusCode: 401, message: 'Token de rafraîchissement invalide ou expiré' } as AppError;
    }

    const user = storedToken.user;
    const tokens = await this.generateTokens(user.id, user.email, user.role as any);

    return tokens;
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await authRepository.revokeRefreshToken(tokenHash);
    }
  }

  async getMe(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'Utilisateur introuvable' } as AppError;
    }
    return user;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const accessToken = jwt.sign(
      { userId, email, role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const refreshTokenRaw = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = this.hashToken(refreshTokenRaw);
    
    // Expire dans 7 jours
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await authRepository.saveRefreshToken(userId, refreshTokenHash, expiresAt);

    return { accessToken, refreshToken: refreshTokenRaw };
  }
}
