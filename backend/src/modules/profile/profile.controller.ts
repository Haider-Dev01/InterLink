import { Request, Response, NextFunction } from 'express';
import { ProfileService } from './profile.service';
import { updateProfileSchema } from './profile.validation';

const profileService = new ProfileService();

export class ProfileController {
  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const profile = await profileService.getMyProfile(userId);

      res.status(200).json({
        success: true,
        data: { profile }
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

      res.status(200).json({
        success: true,
        data: { profile }
      });
    } catch (error) {
      next(error);
    }
  };
}
