import { Request, Response, NextFunction } from 'express';
import { applicationService } from './application.service';

export const applicationController = {
  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const candidateId = req.user!.id;
      const { offerId, coverLetter } = req.body;
      const result = await applicationService.apply(candidateId, offerId, coverLetter);

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const candidateId = req.user!.id;
      const result = await applicationService.getMyApplications(candidateId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getOfferApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const offerId = Array.isArray(req.params.offerId) ? req.params.offerId[0] : req.params.offerId;
      const result = await applicationService.getOfferApplications(offerId);
      
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getRecruiterApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const recruiterId = req.user!.id;
      const offerId = typeof req.query.offerId === 'string' ? req.query.offerId : undefined;
      const result = await applicationService.getRecruiterApplications(recruiterId, offerId);

      return res.status(200).json({
        success: true,
        data: { applications: result },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status } = req.body;
      const result = await applicationService.updateStatus(id, status);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
