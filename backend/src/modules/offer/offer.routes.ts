import { Router } from 'express'
import { authenticate, optionalAuthenticate } from '../../shared/middleware/authenticate'
import { authorize } from '../../shared/middleware/authorize'
import { offerController } from './offer.controller'

const router = Router()

// ── Routes statiques EN PREMIER ──────────────────────────────
router.get('/my', authenticate, authorize(['recruiter']), offerController.getMyOffers)
router.get('/', optionalAuthenticate, offerController.getPublishedOffers)

// ── Routes avec création ─────────────────────────────────────
router.post('/', authenticate, authorize(['recruiter']), offerController.createOffer)

// ── Routes avec sous-chemins AVANT /:id générique ────────────
router.get('/:id/matches', authenticate, authorize(['recruiter']), offerController.getOfferMatches)

// ── Routes avec paramètres EN DERNIER ────────────────────────
router.get('/:id', offerController.getOfferById)
router.put('/:id', authenticate, authorize(['recruiter']), offerController.updateOffer)
router.patch('/:id/publish', authenticate, authorize(['recruiter']), offerController.publishOffer)
router.patch('/:id/archive', authenticate, authorize(['recruiter']), offerController.archiveOffer)
router.delete('/:id', authenticate, authorize(['recruiter', 'admin']), offerController.softDeleteOffer)

export default router
