import { Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ProfileController } from './profile.controller';
import { authenticate } from '../../shared/middleware/authenticate';

const router = Router();
const profileController = new ProfileController();
const avatarUploadDir = path.resolve('./uploads/avatars');

fs.mkdirSync(avatarUploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: avatarUploadDir,
    filename: (_req, file, cb) => {
      cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Format avatar non supporte. PNG, JPG ou WEBP uniquement.'));
  },
  limits: { fileSize: 3 * 1024 * 1024 },
});

// All profile routes require authentication
router.use(authenticate);

router.get('/me', profileController.getMe);
router.patch('/me', profileController.updateMe);
router.post('/avatar', upload.single('avatar'), profileController.uploadAvatar);

export default router;
