import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { authenticate } from '../../shared/middleware/authenticate';

const router = Router();
const profileController = new ProfileController();

// All profile routes require authentication
router.use(authenticate);

router.get('/me', profileController.getMe);
router.patch('/me', profileController.updateMe);

export default router;
