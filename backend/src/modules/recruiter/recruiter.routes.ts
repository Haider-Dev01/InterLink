import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { prisma } from '../../shared/config/prismaClient';

const router = Router();

function formatDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

router.get('/dashboard', authenticate, authorize(['recruiter']), async (req, res, next) => {
  try {
    const recruiterId = req.user!.id;

    const [offers, applications] = await Promise.all([
      prisma.jobOffer.findMany({
        where: { recruiterId, deletedAt: null },
        include: {
          applications: {
            select: {
              applicationStatus: true,
            },
          },
        },
      }),
      prisma.application.findMany({
        where: {
          offer: {
            recruiterId,
            deletedAt: null,
          },
        },
        include: {
          offer: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
    ]);

    const totalOffers = offers.length;
    const totalCandidatesReceived = applications.length;
    const activeApplications = applications.filter((item) =>
      item.applicationStatus === 'pending' || item.applicationStatus === 'interview',
    ).length;

    const offersById = new Map(
      offers.map((offer) => [
        offer.id,
        {
          title: offer.title,
          applications: 0,
          accepted: 0,
        },
      ]),
    );

    for (const application of applications) {
      const bucket = offersById.get(application.offerId);
      if (!bucket) {
        continue;
      }
      bucket.applications += 1;
      if (application.applicationStatus === 'accepted') {
        bucket.accepted += 1;
      }
    }

    const topOffer = [...offersById.values()].sort((a, b) => b.applications - a.applications)[0] ?? null;

    const aiInsightsSummary = topOffer
      ? `${topOffer.title} attire le plus de candidats (${topOffer.applications}). Focus sur la conversion des profils interview en acceptes.`
      : "Publiez votre premiere offre pour debloquer des insights IA sur la performance du recrutement.";

    return res.status(200).json({
      success: true,
      data: {
        totalOffers,
        totalCandidatesReceived,
        activeApplications,
        aiInsightsSummary,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/overview', authenticate, authorize(['recruiter']), async (req, res, next) => {
  try {
    const recruiterId = req.user!.id;
    const lastNDays = 14;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - (lastNDays - 1));
    fromDate.setHours(0, 0, 0, 0);

    const [offers, applications] = await Promise.all([
      prisma.jobOffer.findMany({
        where: { recruiterId, deletedAt: null },
        include: {
          applications: {
            select: {
              id: true,
              applicationStatus: true,
              appliedAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.application.findMany({
        where: {
          offer: {
            recruiterId,
            deletedAt: null,
          },
          appliedAt: {
            gte: fromDate,
          },
        },
        select: {
          id: true,
          applicationStatus: true,
          appliedAt: true,
        },
      }),
    ]);

    const jobPerformance = offers.slice(0, 12).map((offer) => {
      const total = offer.applications.length;
      const interviews = offer.applications.filter((item) => item.applicationStatus === 'interview').length;
      const accepted = offer.applications.filter((item) => item.applicationStatus === 'accepted').length;

      return {
        offerId: offer.id,
        title: offer.title,
        status: offer.offerStatus,
        applications: total,
        interviews,
        accepted,
        conversionRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
      };
    });

    const trendMap = new Map<string, number>();
    for (let i = 0; i < lastNDays; i += 1) {
      const day = new Date(fromDate);
      day.setDate(fromDate.getDate() + i);
      trendMap.set(formatDay(day), 0);
    }
    for (const item of applications) {
      const key = formatDay(item.appliedAt);
      trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
    }
    const applicationTrends = [...trendMap.entries()].map(([date, count]) => ({ date, count }));

    const candidateEngagement = {
      pending: offers.reduce(
        (acc, offer) => acc + offer.applications.filter((item) => item.applicationStatus === 'pending').length,
        0,
      ),
      interview: offers.reduce(
        (acc, offer) => acc + offer.applications.filter((item) => item.applicationStatus === 'interview').length,
        0,
      ),
      accepted: offers.reduce(
        (acc, offer) => acc + offer.applications.filter((item) => item.applicationStatus === 'accepted').length,
        0,
      ),
      rejected: offers.reduce(
        (acc, offer) => acc + offer.applications.filter((item) => item.applicationStatus === 'rejected').length,
        0,
      ),
    };

    return res.status(200).json({
      success: true,
      data: {
        jobPerformance,
        applicationTrends,
        candidateEngagement,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
