import { Request, Response, NextFunction } from 'express'
import { offerService } from './offer.service'
import { createOfferSchema, updateOfferSchema } from './offer.validation'
import { getMatchesForOffer } from './matching.service'
import { AppError } from '../../shared/errors/AppError'
import { prisma } from '../../shared/config/prismaClient'

export const offerController = {
  async createOffer(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('Authentification requise', 401)
      }
      if (req.user.role !== 'recruiter') {
        throw new AppError('Accès refusé: recruteur requis', 403)
      }

      const userId = req.user!.id
      const parsed = createOfferSchema.parse(req.body)
      const result = await offerService.createOffer(userId, parsed)

      return res.status(201).json({
        success: true,
        data: result,
      })
    } catch (error: any) {
      console.error('[POST /jobs] createOffer failed:', error)
      if (error?.code === 'P2003') {
        return next(new AppError('Référence invalide (companyId ou relation manquante)', 400))
      }
      if (error?.code === 'P2002') {
        return next(new AppError('Conflit de données: valeur déjà utilisée', 409))
      }
      next(error)
    }
  },

  async publishOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const offerId = req.params.id as string
      const result = await offerService.publishOffer(offerId, userId)

      return res.status(200).json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      next(error)
    }
  },

  async archiveOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const offerId = req.params.id as string
      const result = await offerService.archiveOffer(offerId, userId)

      return res.status(200).json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      next(error)
    }
  },

  async updateOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const offerId = req.params.id as string
      const parsed = updateOfferSchema.parse(req.body)
      const result = await offerService.updateOffer(offerId, userId, parsed)

      return res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  async softDeleteOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offerId = req.params.id as string
      const result = await offerService.softDeleteOffer(offerId)

      return res.status(200).json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      next(error)
    }
  },

  async getPublishedOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const location = req.query.location as string | undefined
      const remote = req.query.remote !== undefined ? req.query.remote === 'true' : undefined
      const durationMonths = req.query.durationMonths
        ? parseInt(req.query.durationMonths as string)
        : undefined
      const skills = req.query.skills
        ? (req.query.skills as string).split(',')
        : undefined

      // Si candidat authentifié, passer userId pour enrichir avec matchScore
      const userId = req.user?.id

      const result = await offerService.getPublishedOffers({
        location,
        remote,
        durationMonths,
        skills,
        page,
        limit,
        userId,
      })

      return res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  async getOfferById(req: Request, res: Response, next: NextFunction) {
    try {
      const offerId = req.params.id as string
      const result = await offerService.getOfferById(offerId)

      return res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  async getMyOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const result = await offerService.getOffersByRecruiter(userId)

      return res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  async getOfferMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const offerId = req.params.id as string
      const minScore = req.query.minScore
        ? parseFloat(req.query.minScore as string)
        : undefined
      const matches = await getMatchesForOffer(offerId, minScore)

      return res.status(200).json({
        success: true,
        data: { matches },
      })
    } catch (error) {
      next(error)
    }
  },

  async getOfferApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const applications = await prisma.application.findMany({
        where: { offerId: id },
        include: {
          candidate: {
            include: {
              profile: true,
              cvDocuments: {
                where: { isActive: true },
                select: {
                  id: true, fileUrl: true, isActive: true, parseStatus: true,
                  extractedSkills: { include: { skill: true } }
                }
              }
            }
          }
        },
        orderBy: { appliedAt: 'desc' }
      });

      // Ajouter matchScore si disponible
      const withScores = await Promise.all(applications.map(async (app: any) => {
        const score = await prisma.matchScore.findUnique({
          where: {
            candidateId_offerId: {
              candidateId: app.candidateId as string,
              offerId: id as string
            }
          }
        });
        return {
          ...app,
          matchScore: score ? Math.round(score.scoreFinal * 100) : null
        };
      }));

      res.json({ success: true, data: { applications: withScores } });
    } catch (err) {
      next(err);
    }
  },
}
