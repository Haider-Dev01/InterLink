import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { applicationController } from './application.controller';

const router = Router();

router.post('/', authenticate, authorize(['candidate']), applicationController.apply);
router.get('/my', authenticate, authorize(['candidate']), applicationController.getMyApplications);
router.get('/offer/:offerId', authenticate, authorize(['recruiter']), applicationController.getOfferApplications);
router.get('/recruiter', authenticate, authorize(['recruiter']), applicationController.getRecruiterApplications);
router.post('/:id/match', authenticate, authorize(['recruiter']), applicationController.getMatchScore);
router.patch('/:id/status', authenticate, authorize(['recruiter', 'admin']), applicationController.updateStatus);
router.delete('/:id', authenticate, authorize(['candidate']), applicationController.withdrawApplication);

export default router;
