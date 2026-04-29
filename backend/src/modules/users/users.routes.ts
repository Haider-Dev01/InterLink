import { Router } from 'express';
import { z } from 'zod';
import { authenticate, optionalAuthenticate } from '../../shared/middleware/authenticate';
import { prisma } from '../../shared/config/prismaClient';
import { toPublicAssetUrl } from '../../shared/utils/assetUrl';

const router = Router();

function toSafeUserResponse(req: any, user: any) {
  const { passwordHash, ...safeUser } = user;
  const resolvedCompany = safeUser.company ?? safeUser.profile?.company ?? null;
  const profile = safeUser.profile
    ? {
        ...safeUser.profile,
        avatarUrl: toPublicAssetUrl(req, safeUser.profile.avatarUrl),
        company: resolvedCompany,
      }
    : null;

  return {
    ...safeUser,
    company: resolvedCompany,
    profile,
    avatar: profile?.avatarUrl ?? null,
  };
}

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().optional());

const updateMeSchema = z.object({
  firstName: optionalTrimmedString.pipe(z.string().min(2).optional()),
  lastName: optionalTrimmedString.pipe(z.string().min(2).optional()),
  bio: optionalTrimmedString.pipe(z.string().max(500).optional()),
  linkedinUrl: z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().url().optional()),
  githubUsername: optionalTrimmedString,
  location: optionalTrimmedString,
  availabilityMonths: z.number().int().positive().optional(),
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        profile: {
          include: {
            school: true,
            company: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: toSafeUserResponse(req, user),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/me', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const parsed = updateMeSchema.parse(req.body);
    const { location, availabilityMonths, ...profileData } = parsed;

    await prisma.$transaction([
      prisma.profile.update({
        where: { userId },
        data: profileData,
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          ...(location !== undefined ? { location } : {}),
          ...(availabilityMonths !== undefined ? { availabilityMonths } : {}),
        },
      }),
    ]);

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        profile: {
          include: {
            school: true,
            company: true,
          },
        },
      },
    });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: toSafeUserResponse(req, updatedUser),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const [profile, activeApplicationsCount, upcomingInterviewsCount, recommendedJobsCount] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId },
        select: { viewsCount: true },
      }),
      prisma.application.count({
        where: {
          candidateId: userId,
          applicationStatus: { in: ['pending', 'interview'] },
        },
      }),
      prisma.application.count({
        where: {
          candidateId: userId,
          applicationStatus: 'interview',
        },
      }),
      prisma.matchScore.count({
        where: {
          candidateId: userId,
          offer: {
            offerStatus: 'published',
            deletedAt: null,
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          profileViews: profile?.viewsCount ?? 0,
          activeApplications: activeApplicationsCount,
          upcomingInterviews: upcomingInterviewsCount,
          recommendedJobs: recommendedJobsCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', optionalAuthenticate, async (req, res, next) => {
  try {
    const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const viewerUserId = req.user?.id;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Identifiant utilisateur manquant' });
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        company: true,
        profile: {
          include: {
            school: true,
            company: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    if (viewerUserId && viewerUserId !== targetUserId) {
      await prisma.profile.updateMany({
        where: { userId: targetUserId },
        data: {
          viewsCount: {
            increment: 1,
          },
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: toSafeUserResponse(req, user),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/profile', optionalAuthenticate, async (req, res, next) => {
  try {
    const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const viewerUserId = req.user?.id;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Identifiant utilisateur manquant' });
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        company: true,
        profile: {
          include: {
            school: true,
            company: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    if (viewerUserId && viewerUserId !== targetUserId) {
      await prisma.profile.updateMany({
        where: { userId: targetUserId },
        data: {
          viewsCount: {
            increment: 1,
          },
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: toSafeUserResponse(req, user),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
