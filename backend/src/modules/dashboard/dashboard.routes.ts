import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { prisma } from '../../shared/config/prismaClient';
import { Role } from '../../generated/prisma';

const router = Router();

function scoreTextMatch(target: string, referenceTerms: string[]) {
  const normalizedTarget = target.toLowerCase();
  return referenceTerms.reduce((acc, term) => {
    if (!term) {
      return acc;
    }
    if (normalizedTarget === term) {
      return acc + 10;
    }
    if (normalizedTarget.startsWith(term)) {
      return acc + 6;
    }
    if (normalizedTarget.includes(term)) {
      return acc + 3;
    }
    return acc;
  }, 0);
}

async function getRecommendedJobsForRole(userId: string, role: Role) {
  if (role !== 'candidate') {
    const offers = await prisma.jobOffer.findMany({
      where: {
        offerStatus: 'published',
        deletedAt: null,
      },
      include: {
        company: true,
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 8,
    });

    return offers.map((offer) => ({ ...offer, matchScore: null }));
  }

  const topMatches = await prisma.matchScore.findMany({
    where: {
      candidateId: userId,
      offer: {
        offerStatus: 'published',
        deletedAt: null,
      },
    },
    include: {
      offer: {
        include: {
          company: true,
          offerSkills: {
            include: {
              skill: true,
            },
          },
        },
      },
    },
    orderBy: [{ scoreFinal: 'desc' }, { computedAt: 'desc' }],
    take: 8,
  });

  if (topMatches.length > 0) {
    return topMatches.map((match) => ({
      ...match.offer,
      matchScore: Math.round(match.scoreFinal * 100),
    }));
  }

  const [user, activeCv] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        location: true,
        availabilityMonths: true,
      },
    }),
    prisma.cvDocument.findFirst({
      where: {
        userId,
        isActive: true,
        parseStatus: 'done',
      },
      select: {
        id: true,
        parsedText: true,
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  const extractedSkills = activeCv
    ? await prisma.extractedSkill.findMany({
        where: { cvDocumentId: activeCv.id },
        include: { skill: true },
      })
    : [];

  const skillTerms = extractedSkills.map((row) => row.skill.name.toLowerCase());
  const cvTerms = (activeCv?.parsedText ?? '')
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/i)
    .filter((term) => term.length >= 3)
    .slice(0, 40);
  const terms = [...new Set([...skillTerms, ...cvTerms])];

  const candidateOffers = await prisma.jobOffer.findMany({
    where: {
      offerStatus: 'published',
      deletedAt: null,
    },
    include: {
      company: true,
      offerSkills: {
        include: {
          skill: true,
        },
      },
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 80,
  });

  const ranked = candidateOffers.map((offer) => {
    const offerSkillTerms = offer.offerSkills.map((item) => item.skill.name.toLowerCase());
    const matchedSkills = offerSkillTerms.filter((term) => skillTerms.includes(term));
    const skillsScore = offerSkillTerms.length > 0 ? (matchedSkills.length / offerSkillTerms.length) * 100 : 0;

    const textScore =
      scoreTextMatch(offer.title, terms) * 2 +
      scoreTextMatch(offer.description, terms) +
      scoreTextMatch(offer.company.name, terms);

    const locationScore =
      offer.remote || !user?.location || !offer.location
        ? 8
        : offer.location.toLowerCase() === user.location.toLowerCase()
          ? 12
          : 0;

    const availabilityScore =
      user?.availabilityMonths && offer.durationMonths
        ? Math.max(0, 12 - Math.abs(user.availabilityMonths - offer.durationMonths) * 2)
        : 5;

    const publishedAt = offer.publishedAt ?? offer.createdAt;
    const freshnessDays = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24);
    const freshnessScore = Math.max(0, 20 - freshnessDays * 0.7);

    const totalScore = skillsScore + textScore + locationScore + availabilityScore + freshnessScore;

    return {
      offer,
      totalScore,
    };
  });

  return ranked
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 8)
    .map(({ offer, totalScore }) => ({
      ...offer,
      matchScore: Math.max(0, Math.min(99, Math.round(totalScore))),
    }));
}

router.get('/jobs/recommended', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const offers = await getRecommendedJobsForRole(userId, userRole);

    return res.status(200).json({
      success: true,
      data: {
        offers,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/applications/active', authenticate, authorize(['candidate']), async (req, res, next) => {
  try {
    const candidateId = req.user!.id;

    const applications = await prisma.application.findMany({
      where: {
        candidateId,
        applicationStatus: { in: ['pending', 'interview'] },
      },
      include: {
        offer: {
          include: { company: true },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: { applications } });
  } catch (error) {
    next(error);
  }
});

router.get('/interviews/upcoming', authenticate, authorize(['candidate']), async (req, res, next) => {
  try {
    const candidateId = req.user!.id;

    const interviews = await prisma.application.findMany({
      where: {
        candidateId,
        applicationStatus: 'interview',
      },
      include: {
        offer: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { updatedAt: 'asc' },
      take: 20,
    });

    return res.status(200).json({
      success: true,
      data: {
        interviews: interviews.map((application) => ({
          id: application.id,
          scheduledAt: application.updatedAt,
          status: application.applicationStatus,
          offer: application.offer,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
