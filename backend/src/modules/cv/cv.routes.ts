import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { authenticate } from '../../shared/middleware/authenticate'
import { authorize } from '../../shared/middleware/authorize'
import { cvController } from './cv.controller'

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, uuidv4() + ext)
  },
})

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Format non supporté. PDF ou DOCX uniquement.'))
  }
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

const router = Router()

// POST /api/cv/upload
router.post(
  '/upload',
  authenticate,
  authorize(['candidate']),
  uploadMiddleware.single('file'),
  cvController.upload
)

// GET /api/cv/my-cv
router.get('/my-cv', authenticate, authorize(['candidate']), cvController.getMyCV)

export default router
