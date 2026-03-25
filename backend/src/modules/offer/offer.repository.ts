import { prisma } from '../../shared/config/prismaClient'
import { Prisma } from '../../generated/prisma'
import { CreateOfferInput, UpdateOfferInput } from './offer.validation'

export const offerRepository = {
  async createOffer(companyId: string, recruiterId: string, data: CreateOfferInput) {
    const { skills, ...offerData } = data

    const offer = await prisma.jobOffer.create({
      data: {
        ...offerData,
        companyId,
        recruiterId,
        offerStatus: 'draft',
      },
    })

    // Créer les offer_skills
    for (const skillName of skills) {
      let skill = await prisma.skill.findUnique({ where: { name: skillName } })
      if (!skill) {
        skill = await prisma.skill.create({ data: { name: skillName } })
      }
      await prisma.offerSkill.create({
        data: { offerId: offer.id, skillId: skill.id, isRequired: true },
      })
    }

    return prisma.jobOffer.findUnique({
      where: { id: offer.id },
      include: { offerSkills: { include: { skill: true } } },
    })
  },

  async getOfferById(offerId: string) {
    return prisma.jobOffer.findUnique({
      where: { id: offerId },
      include: { offerSkills: { include: { skill: true } }, company: true },
    })
  },

  async getOffersByRecruiter(recruiterId: string) {
    return prisma.jobOffer.findMany({
      where: { recruiterId, deletedAt: null },
      include: { offerSkills: { include: { skill: true } } },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getPublishedOffers(filters: {
    location?: string
    remote?: boolean
    durationMonths?: number
    skills?: string[]
    page: number
    limit: number
  }) {
    const where: Prisma.JobOfferWhereInput = {
      offerStatus: 'published',
      deletedAt: null,
    }

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' }
    }
    if (filters.remote !== undefined) {
      where.remote = filters.remote
    }
    if (filters.durationMonths) {
      where.durationMonths = filters.durationMonths
    }
    if (filters.skills && filters.skills.length > 0) {
      where.offerSkills = {
        some: {
          skill: { name: { in: filters.skills } },
        },
      }
    }

    const skip = (filters.page - 1) * filters.limit

    const [offers, total] = await Promise.all([
      prisma.jobOffer.findMany({
        where,
        include: { offerSkills: { include: { skill: true } }, company: true },
        skip,
        take: filters.limit,
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.jobOffer.count({ where }),
    ])

    return { offers, total }
  },

  async updateOffer(offerId: string, data: UpdateOfferInput) {
    const { skills, ...offerData } = data

    const offer = await prisma.jobOffer.update({
      where: { id: offerId },
      data: { ...offerData, updatedAt: new Date() },
    })

    if (skills) {
      // Supprimer les anciennes skills
      await prisma.offerSkill.deleteMany({ where: { offerId } })
      // Recréer
      for (const skillName of skills) {
        let skill = await prisma.skill.findUnique({ where: { name: skillName } })
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skillName } })
        }
        await prisma.offerSkill.create({
          data: { offerId, skillId: skill.id, isRequired: true },
        })
      }
    }

    return prisma.jobOffer.findUnique({
      where: { id: offerId },
      include: { offerSkills: { include: { skill: true } } },
    })
  },

  async publishOffer(offerId: string) {
    return prisma.jobOffer.update({
      where: { id: offerId },
      data: { offerStatus: 'published', publishedAt: new Date() },
    })
  },

  async archiveOffer(offerId: string) {
    return prisma.jobOffer.update({
      where: { id: offerId },
      data: { offerStatus: 'archived' },
    })
  },

  async softDeleteOffer(offerId: string) {
    return prisma.jobOffer.update({
      where: { id: offerId },
      data: { deletedAt: new Date() },
    })
  },

  async updateOfferEmbedding(offerId: string, embedding: number[]) {
    const embeddingStr = '[' + embedding.join(',') + ']'
    await prisma.$executeRaw`
      UPDATE job_offers
      SET embedding = ${embeddingStr}::vector(384)
      WHERE id = ${offerId}
    `
  },

  async getRecruiterCompany(recruiterId: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId: recruiterId },
      include: { company: true },
    })
    return profile?.company ?? null
  },
}
