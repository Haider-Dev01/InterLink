import { Request, Response, NextFunction } from 'express'
import { offerService } from './offer.service'
import { createOfferSchema, updateOfferSchema } from './offer.validation'

export const offerController = {
  async createOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const parsed = createOfferSchema.parse(req.body)
      const result = await offerService.createOffer(userId, parsed)

      return res.status(201).json({
        success: true,
        data: result,
      })
    } catch (error) {
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

      const result = await offerService.getPublishedOffers({
        location,
        remote,
        durationMonths,
        skills,
        page,
        limit,
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
}
