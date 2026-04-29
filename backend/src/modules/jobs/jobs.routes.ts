import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { offerController } from '../offer/offer.controller';

const router = Router();

router.get('/my', authenticate, authorize(['recruiter']), offerController.getMyOffers);
router.get('/', optionalAuthenticate, offerController.getPublishedOffers);
router.post('/', authenticate, authorize(['recruiter']), offerController.createOffer);
router.get('/:id', offerController.getOfferById);
router.put('/:id', authenticate, authorize(['recruiter']), offerController.updateOffer);
router.delete('/:id', authenticate, authorize(['recruiter', 'admin']), offerController.softDeleteOffer);

export default router;
