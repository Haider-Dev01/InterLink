import { prisma } from '../../shared/config/prismaClient';
import { UpdateProfileDto } from './profile.validation';

export class ProfileRepository {
  async getProfileByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: { userId },
      include: {
        school: true,
        company: true,
      },
    });
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const { location, availabilityMonths, ...profileData } = data;

    // Run in transaction if user data needs updating
    if (location !== undefined || availabilityMonths !== undefined) {
      const userUpdateData: any = {};
      if (location !== undefined) userUpdateData.location = location;
      if (availabilityMonths !== undefined) userUpdateData.availabilityMonths = availabilityMonths;

      const [updatedProfile] = await prisma.$transaction([
        prisma.profile.update({
          where: { userId },
          data: profileData,
          include: { school: true, company: true }
        }),
        prisma.user.update({
          where: { id: userId },
          data: userUpdateData,
        })
      ]);
      return updatedProfile;
    }

    return prisma.profile.update({
      where: { userId },
      data: profileData,
      include: { school: true, company: true }
    });
  }
}
