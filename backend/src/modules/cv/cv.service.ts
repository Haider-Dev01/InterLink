import path from 'path'
import fs from 'fs'
import cron from 'node-cron'
import { cvRepository } from './cv.repository'
import { triggerMatchingForCandidate } from '../offer/matching.service'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8002'

export const cvService = {
  async uploadCV(userId: string, file: Express.Multer.File) {
    const absolutePath = path.resolve(process.cwd(), file.path)
    const fileUrl = absolutePath.replace(/\\/g, '/')

    // 1. Créer le document en BDD
    const cvDoc = await cvRepository.createCvDocument(userId, fileUrl, 'upload')

    // 2. Activer ce CV
    await cvRepository.setActiveCV(userId, cvDoc.id)

    // 3. Lancer le parsing en arrière-plan (sans await)
    parseInBackground(cvDoc.id, fileUrl, userId)

    return { cvId: cvDoc.id, message: 'CV uploadé, analyse en cours' }
  },

  async getMyCV(userId: string) {
    const cv = await cvRepository.getActiveCv(userId)
    if (!cv) {
      return { cv: null }
    }

    const metadata = await cvRepository.getLatestParsingMetadata(cv.id)
    
    // Auto-sync bio if missing for the user
    const user = await cvRepository.getUserById(userId)
    const currentBio = user?.profile?.bio
    
    if (!currentBio && metadata?.sections) {
      const sections = metadata.sections as Record<string, string>
      const bioKeys = [
        'summary', 'professional summary', 'objective', 'about me', 'profile', 'biography', 'about',
        'résumé', 'résumé professionnel', 'profil', 'à propos', 'biographie', 'objectif'
      ]
      let extractedBio = ''
      for (const key of Object.keys(sections)) {
        if (bioKeys.some(bk => key.toLowerCase().includes(bk))) {
          extractedBio = sections[key]
          break
        }
      }
      
      if (extractedBio) {
        await cvRepository.updateUserProfileBio(userId, extractedBio)
        console.log(`[CV] 🔄 Auto-sync bio for user ${userId} from existing CV metadata`)
      }
    }

    return {
      cv: {
        ...cv,
        parsing: {
          score: metadata?.score ?? 0,
          sections: metadata?.sections ?? {},
        },
      },
    }
  },

  async getMySkills(userId: string) {
    const cv = await cvRepository.getActiveCv(userId)
    const skills = (cv?.extractedSkills ?? []).map((item) => item.skill.name)
    return { skills }
  },
}

async function parseInBackground(cvId: string, fileUrl: string, userId: string) {
  try {
    await cvRepository.updateCvProcessing(cvId)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    // fileUrl est déjà absolu d'après uploadCV, mais path.resolve sur un chemin absolu reste correct
    const absoluteFilePath = path.resolve(fileUrl)

    if (!fs.existsSync(absoluteFilePath)) {
      throw new Error(`Fichier introuvable: ${absoluteFilePath}`)
    }

    const fileBuffer = await fs.promises.readFile(absoluteFilePath)
    const formData = new FormData()
    const filename = path.basename(fileUrl)
    formData.append('file', new Blob([new Uint8Array(fileBuffer)]), filename)

    const response = await fetch(`${AI_SERVICE_URL}/parse`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`AI Service error: ${response.status}`)
    }

    const data = await response.json() as {
      text: string
      skills: string[]
      sections?: Record<string, string>
      score?: number
      embedding: number[]
    }

    await cvRepository.updateCvParsed(cvId, data.text, data.skills, data.embedding)
    await cvRepository.upsertExtractedSkills(cvId, data.skills)
    await cvRepository.saveParsingMetadata(cvId, userId, data.score ?? 0, data.sections ?? {})

    // Extract Bio/Summary from sections
    const sections = data.sections || {}
    const bioKeys = [
      'summary', 'professional summary', 'objective', 'about me', 'profile', 'biography', 'about',
      'résumé', 'résumé professionnel', 'profil', 'à propos', 'biographie', 'objectif'
    ]
    let extractedBio = ''
    
    for (const key of Object.keys(sections)) {
      if (bioKeys.some(bk => key.toLowerCase().includes(bk))) {
        extractedBio = sections[key]
        break
      }
    }

    if (extractedBio) {
      await cvRepository.updateUserProfileBio(userId, extractedBio)
      console.log(`[CV] 📝 Bio extraite et mise à jour pour l'utilisateur : ${userId}`)
    }

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
      await parseInBackground(cv.id, cv.fileUrl, cv.userId)
    }
  })
  console.log('[CV Cron] ✅ Cron job démarré (toutes les 3 minutes)')
}
