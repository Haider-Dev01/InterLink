import { ProfileRepository } from './profile.repository';
import { UpdateProfileDto } from './profile.validation';
import { AppError } from '../../shared/errors/AppError';

const profileRepository = new ProfileRepository();

export class ProfileService {
  async getMyProfile(userId: string) {
    const profile = await profileRepository.getProfileByUserId(userId);
    if (!profile) {
      throw { statusCode: 404, message: 'Profil introuvable' } as AppError;
    }
    return profile;
  }

  async updateMyProfile(userId: string, data: UpdateProfileDto) {
    // If no profile exists, maybe it should be created, but based on DB schema it is created at registration.
    const profile = await profileRepository.getProfileByUserId(userId);
    if (!profile) {
      throw { statusCode: 404, message: 'Profil introuvable' } as AppError;
    }

    const updatedProfile = await profileRepository.updateProfile(userId, data);
    return updatedProfile;
  }

  async updateMyAvatar(userId: string, avatarUrl: string) {
    const profile = await profileRepository.getProfileByUserId(userId);
    if (!profile) {
      throw { statusCode: 404, message: 'Profil introuvable' } as AppError;
    }

    return profileRepository.updateAvatar(userId, avatarUrl);
  }
}
