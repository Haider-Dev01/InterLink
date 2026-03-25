import { offerRepository } from './offer.repository'
import { CreateOfferInput, UpdateOfferInput } from './offer.validation'
import { AppError } from '../../shared/middleware/errorHandler'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8002'

export const offerService = {
  async createOffer(recruiterId: string, data: CreateOfferInput) {
    const company = await offerRepository.getRecruiterCompany(recruiterId)
    if (!company) {
      throw { statusCode: 403, message: "Vous devez d'abord enregistrer une entreprise" } as AppError
    }

    const offer = await offerRepository.createOffer(company.id, recruiterId, data)
    return { offer }
  },

  async publishOffer(offerId: string, recruiterId: string) {
    const offer = await offerRepository.getOfferById(offerId)
    if (!offer) {
      throw { statusCode: 404, message: 'Offre introuvable' } as AppError
    }
    if (offer.recruiterId !== recruiterId) {
      throw { statusCode: 403, message: 'Accès refusé' } as AppError
    }
    if (offer.offerStatus !== 'draft') {
      throw { statusCode: 400, message: "Seule une offre en brouillon peut être publiée" } as AppError
    }

    const company = await offerRepository.getRecruiterCompany(recruiterId)
    if (!company || !company.isVerified) {
      throw { statusCode: 403, message: "Entreprise non vérifiée par l'admin" } as AppError
    }

    await offerRepository.publishOffer(offerId)

    // Générer embedding en arrière-plan (sans await)
    generateEmbeddingBackground(offerId)

    return { message: 'Offre publiée, matching en cours' }
  },

  async updateOffer(offerId: string, recruiterId: string, data: UpdateOfferInput) {
    const offer = await offerRepository.getOfferById(offerId)
    if (!offer) {
      throw { statusCode: 404, message: 'Offre introuvable' } as AppError
    }
    if (offer.recruiterId !== recruiterId) {
      throw { statusCode: 403, message: 'Accès refusé' } as AppError
    }

    const updated = await offerRepository.updateOffer(offerId, data)

    // Regénérer embedding si offre publiée et skills modifiés
    if (offer.offerStatus === 'published' && data.skills) {
      generateEmbeddingBackground(offerId)
    }

    return { offer: updated }
  },

  async archiveOffer(offerId: string, recruiterId: string) {
    const offer = await offerRepository.getOfferById(offerId)
    if (!offer) {
      throw { statusCode: 404, message: 'Offre introuvable' } as AppError
    }
    if (offer.recruiterId !== recruiterId) {
      throw { statusCode: 403, message: 'Accès refusé' } as AppError
    }
    if (offer.offerStatus === 'archived') {
      throw { statusCode: 400, message: 'Cette offre est déjà archivée' } as AppError
    }

    await offerRepository.archiveOffer(offerId)
    return { message: 'Offre archivée' }
  },

  async softDeleteOffer(offerId: string) {
    const offer = await offerRepository.getOfferById(offerId)
    if (!offer) {
      throw { statusCode: 404, message: 'Offre introuvable' } as AppError
    }
    await offerRepository.softDeleteOffer(offerId)
    return { message: 'Offre supprimée' }
  },

  async getPublishedOffers(filters: {
    location?: string
    remote?: boolean
    durationMonths?: number
    skills?: string[]
    page: number
    limit: number
  }) {
    const { offers, total } = await offerRepository.getPublishedOffers(filters)
    return { offers, total, page: filters.page, limit: filters.limit }
  },

  async getOfferById(offerId: string) {
    const offer = await offerRepository.getOfferById(offerId)
    if (!offer) {
      throw { statusCode: 404, message: 'Offre introuvable' } as AppError
    }
    return { offer }
  },

  async getOffersByRecruiter(recruiterId: string) {
    const offers = await offerRepository.getOffersByRecruiter(recruiterId)
    return { offers }
  },
}

async function generateEmbeddingBackground(offerId: string) {
  try {
    const offer = await offerRepository.getOfferById(offerId)
    if (!offer) return

    const skillNames = offer.offerSkills.map((os: any) => os.skill.name)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(`${AI_SERVICE_URL}/embed/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: offer.title,
        description: offer.description,
        skills: skillNames,
        location: offer.location,
        duration_months: offer.durationMonths,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`AI Service error: ${response.status}`)
    }

    const data = await response.json() as { embedding: number[] }
    await offerRepository.updateOfferEmbedding(offerId, data.embedding)
    console.log(`[Offer] ✅ Embedding offre généré : ${offerId}`)
  } catch (error) {
    console.error(`[Offer] ❌ Embedding offre échoué : ${offerId}`, error)
  }
}
