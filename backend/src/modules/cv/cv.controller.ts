import { Request, Response, NextFunction } from 'express'
import { cvService } from './cv.service'
import { validateUploadFile } from './cv.validation'
import { AppError } from '../../shared/errors/AppError';
import { toPublicAssetUrl } from '../../shared/utils/assetUrl';

export const cvController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const validation = validateUploadFile(req.file)

      if (!validation.valid) {
        return next({ statusCode: 400, message: validation.error } as AppError)
      }

      const result = await cvService.uploadCV(userId, req.file!)

      return res.status(201).json({
        success: true,
        data: { cvId: result.cvId },
        message: result.message,
      })
    } catch (error) {
      next(error)
    }
  },

  async getMyCV(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const result = await cvService.getMyCV(userId)

      return res.status(200).json({
        success: true,
        data: {
          ...result,
          cv: result.cv
            ? {
                ...result.cv,
                fileUrl: toPublicAssetUrl(req, result.cv.fileUrl),
              }
            : null,
        },
      })
    } catch (error) {
      next(error)
    }
  },

  async getMySkills(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const result = await cvService.getMySkills(userId)

      return res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },
}
