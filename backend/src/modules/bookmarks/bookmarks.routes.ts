import { Router } from 'express';
import { prisma } from '../../shared/config/prismaClient';
import { authenticate } from '../../shared/middleware/authenticate';

const router = Router();

// Bookmark an offer
router.post('/:offerId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const offerId = req.params.offerId as string;

    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_offerId: {
          userId,
          offerId,
        },
      },
      update: {},
      create: {
        userId,
        offerId,
      },
    });

    res.status(201).json({
      success: true,
      data: { bookmark },
    });
  } catch (error) {
    next(error);
  }
});

// Remove a bookmark
router.delete('/:offerId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const offerId = req.params.offerId as string;

    await prisma.bookmark.delete({
      where: {
        userId_offerId: {
          userId,
          offerId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Offre retiree des favoris',
    });
  } catch (error) {
    next(error);
  }
});

// Get all bookmarks for current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        offer: {
          include: {
            company: true,
            offerSkills: {
              include: {
                skill: true,
              },
            },
            matchScores: {
              where: { candidateId: userId },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedBookmarks = bookmarks.map((b) => {
      const match = b.offer.matchScores?.[0];
      return {
        ...b.offer,
        matchScore: match ? Math.round(match.scoreFinal * 100) : 0,
        matchScores: undefined, // Remove to clean up
      };
    });

    res.status(200).json({
      success: true,
      data: { bookmarks: formattedBookmarks },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
