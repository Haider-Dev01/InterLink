import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from './auth.validation';
import { env } from '../../shared/config/env';
import { toPublicAssetUrl } from '../../shared/utils/assetUrl';

const authService = new AuthService();

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.register(validatedData);

      this.setCookies(res, refreshToken);

      res.status(201).json({
        success: true,
        data: { accessToken, user: this.sanitizeUser(req, user) },
        message: 'Compte créé avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.login(validatedData);

      this.setCookies(res, refreshToken);

      res.status(200).json({
        success: true,
        data: { accessToken, user: this.sanitizeUser(req, user) },
        message: 'Connexion réussie'
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(refreshToken);

      this.setCookies(res, newRefreshToken);

      res.status(200).json({
        success: true,
        data: { accessToken }
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      await authService.logout(refreshToken);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(200).json({
        success: true,
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const user = await authService.getMe(userId);

      res.status(200).json({
        success: true,
        data: { user: this.sanitizeUser(req, user) }
      });
    } catch (error) {
      next(error);
    }
  };

  private setCookies(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production', // false en dev comme demandé
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });
  }

  private sanitizeUser(req: Request, user: any) {
    const { passwordHash, ...rest } = user;
    const resolvedCompany = rest.company ?? rest.profile?.company ?? null;
    const profile = rest.profile
      ? {
          ...rest.profile,
          avatarUrl: toPublicAssetUrl(req, rest.profile.avatarUrl),
          company: resolvedCompany,
        }
      : null;

    return {
      ...rest,
      company: resolvedCompany,
      profile,
      avatar: profile?.avatarUrl ?? null,
    };
  }
}
