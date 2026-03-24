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

  async updateCvFailed(cvId: string) {
    await prisma.$executeRaw`
      UPDATE cv_documents
      SET parse_status = 'failed',
          retry_count = retry_count + 1,
          last_attempt_at = NOW()
      WHERE id = ${cvId}
    `
  },

  async getActiveCv(userId: string) {
    return prisma.cvDocument.findFirst({
      where: { userId, isActive: true },
      include: {
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
}
