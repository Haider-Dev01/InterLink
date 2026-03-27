import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import cron from 'node-cron'
import { cvRepository } from './cv.repository'
import { triggerMatchingForCandidate } from '../offer/matching.service'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8002'
const UPLOADS_DIR = path.resolve('./uploads')

function detectFileType(fileUrl: string): string {
  const ext = path.extname(fileUrl).toLowerCase()
  if (ext === '.pdf') return 'pdf'
  if (ext === '.docx' || ext === '.doc') return 'docx'
  return 'pdf'
}

export const cvService = {
  async uploadCV(userId: string, file: Express.Multer.File) {
    const fileUrl = file.path.replace(/\\/g, '/')
    const fileType = detectFileType(file.originalname)

    // 1. Créer le document en BDD
    const cvDoc = await cvRepository.createCvDocument(userId, fileUrl, 'upload')

    // 2. Activer ce CV
    await cvRepository.setActiveCV(userId, cvDoc.id)

    // 3. Lancer le parsing en arrière-plan (sans await)
    parseInBackground(cvDoc.id, fileUrl, fileType, userId)

    return { cvId: cvDoc.id, message: 'CV uploadé, analyse en cours' }
  },

  async getMyCV(userId: string) {
    const cv = await cvRepository.getActiveCv(userId)
    return { cv }
  },
}

async function parseInBackground(cvId: string, fileUrl: string, fileType: string, userId: string) {
  try {
    await cvRepository.updateCvProcessing(cvId)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const absoluteFilePath = path.resolve(process.cwd(), fileUrl)

    const response = await fetch(`${AI_SERVICE_URL}/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_url: absoluteFilePath, file_type: fileType }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`AI Service error: ${response.status}`)
    }

    const data = await response.json() as { text: string; skills: string[]; embedding: number[] }

    await cvRepository.updateCvParsed(cvId, data.text, data.skills, data.embedding)
    await cvRepository.upsertExtractedSkills(cvId, data.skills)
    console.log(`[CV] ✅ CV parsé avec succès : ${cvId}`)

    // Déclencher le matching en arrière-plan (sans await)
    triggerMatchingForCandidate(cvId, userId).catch((err) =>
      console.error('[Matching] ❌ Matching candidat échoué:', err)
    )
  } catch (error) {
    await cvRepository.updateCvFailed(cvId)
    console.error(`[CV] ❌ Parsing échoué : ${cvId}`, error)
  }
}

export function startRetryJob() {
  cron.schedule('*/3 * * * *', async () => {
    console.log('[CV Cron] 🔄 Vérification des CVs en attente...')
    const pendingCvs = await cvRepository.getPendingCvs()
    for (const cv of pendingCvs) {
      const fileType = detectFileType(cv.fileUrl)
      await parseInBackground(cv.id, cv.fileUrl, fileType, cv.userId)
    }
  })
  console.log('[CV Cron] ✅ Cron job démarré (toutes les 3 minutes)')
}
