import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { ProfileService } from './profile.service';
import { updateProfileSchema } from './profile.validation';
import { toPublicAssetUrl } from '../../shared/utils/assetUrl';

const profileService = new ProfileService();

export class ProfileController {
  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const profile = await profileService.getMyProfile(userId);
      const currentAvatarUrl = (profile as any).avatarUrl;
      res.status(200).json({
        success: true,
        data: {
          profile: {
            ...profile,
            avatarUrl: toPublicAssetUrl(req, currentAvatarUrl),
          },
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const validatedData = updateProfileSchema.parse(req.body);
      const profile = await profileService.updateMyProfile(userId, validatedData);
      const currentAvatarUrl = (profile as any).avatarUrl;

      res.status(200).json({
        success: true,
        data: {
          profile: {
            ...profile,
            avatarUrl: toPublicAssetUrl(req, currentAvatarUrl),
          },
        }
      });
    } catch (error) {
      next(error);
    }
  };

  uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Fichier avatar manquant' });
      }

      const avatarPath = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');
      const profile = await profileService.updateMyAvatar(userId, avatarPath);
      const currentAvatarUrl = (profile as any).avatarUrl;

      res.status(200).json({
        success: true,
        data: {
          profile: {
            ...profile,
            avatarUrl: toPublicAssetUrl(req, currentAvatarUrl),
          },
          avatarUrl: toPublicAssetUrl(req, currentAvatarUrl),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
