import { prisma } from '../../shared/config/prismaClient'
import { ImportedFrom } from '../../generated/prisma'

export const cvRepository = {
  async createCvDocument(userId: string, fileUrl: string, importedFrom: ImportedFrom) {
    return prisma.cvDocument.create({
      data: {
        userId,
        fileUrl,
        importedFrom,
        parseStatus: 'pending',
        isActive: false,
      },
      select: {
        id: true, userId: true, fileUrl: true, importedFrom: true, 
        parseStatus: true, isActive: true, createdAt: true, updatedAt: true
      }
    })
  },

  async setActiveCV(userId: string, cvId: string) {
    // Désactiver tous les anciens CVs
    await prisma.cvDocument.updateMany({
      where: { userId },
      data: { isActive: false },
    })
    // Activer le nouveau
    await prisma.cvDocument.update({
      where: { id: cvId },
      data: { isActive: true },
    })
  },

  async updateCvProcessing(cvId: string) {
    await prisma.cvDocument.update({
      where: { id: cvId },
      data: { parseStatus: 'processing' },
    })
  },

  async updateCvParsed(cvId: string, parsedText: string, skills: string[], embedding: number[]) {
    // Mettre à jour texte et status
    await prisma.cvDocument.update({
      where: { id: cvId },
      data: {
        parsedText,
        parseStatus: 'done',
        updatedAt: new Date(),
      },
    })
    // Storing the vector via raw SQL (pgvector requires this)
    const embeddingString = `[${embedding.join(',')}]`
    await prisma.$executeRaw`
      UPDATE cv_documents
      SET embedding = ${embeddingString}::vector(384)
      WHERE id = ${cvId}
    `
  },

  async saveParsingMetadata(cvId: string, actorId: string, score: number, sections: Record<string, string>) {
    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'CV_PARSED',
        entityType: 'CV_DOCUMENT',
        entityId: cvId,
        metadata: {
          score,
          sections,
        },
      },
    })
  },

  async getLatestParsingMetadata(cvId: string) {
    const log = await prisma.auditLog.findFirst({
      where: {
        entityType: 'CV_DOCUMENT',
        entityId: cvId,
        action: 'CV_PARSED',
      },
      orderBy: { createdAt: 'desc' },
      select: { metadata: true },
    })
    return log?.metadata as { score?: number; sections?: Record<string, string> } | undefined
  },

  async updateCvFailed(cvId: string) {
    await prisma.$executeRaw`
      UPDATE cv_documents
      SET "parseStatus" = 'failed',
          "retryCount" = "retryCount" + 1,
          "lastAttemptAt" = NOW()
      WHERE id = ${cvId}
    `
  },

  async getActiveCv(userId: string) {
    return prisma.cvDocument.findFirst({
      where: { userId, isActive: true },
      select: {
        id: true, userId: true, fileUrl: true, importedFrom: true, 
        parseStatus: true, isActive: true, parsedText: true,
        createdAt: true, updatedAt: true,
        extractedSkills: {
          include: { skill: true },
        },
      },
    })
  },

  async getPendingCvs() {
    return prisma.cvDocument.findMany({
      where: {
        parseStatus: 'pending',
        retryCount: { lt: 3 },
      },
      select: {
        id: true, userId: true, fileUrl: true, importedFrom: true, 
        parseStatus: true, isActive: true, retryCount: true, lastAttemptAt: true,
        createdAt: true, updatedAt: true
      }
    })
  },

  async upsertExtractedSkills(cvId: string, skills: string[]) {
    for (const skillName of skills) {
      // Find or create skill
      let skill = await prisma.skill.findUnique({ where: { name: skillName } })
      if (!skill) {
        skill = await prisma.skill.create({ data: { name: skillName } })
      }
      // Upsert extracted_skill
      await prisma.extractedSkill.upsert({
        where: {
          cvDocumentId_skillId: {
            cvDocumentId: cvId,
            skillId: skill.id,
          },
        },
        update: {},
        create: {
          cvDocumentId: cvId,
          skillId: skill.id,
        },
      })
    }
  },

  async updateUserProfileBio(userId: string, bio: string) {
    await prisma.profile.upsert({
      where: { userId },
      update: { bio },
      create: { userId, bio, firstName: '', lastName: '' }
    })
  },

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    })
  }
}
