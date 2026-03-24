import { z } from 'zod'

export const allowedMimetypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

export const validateUploadFile = (file: Express.Multer.File | undefined): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'Aucun fichier fourni.' }
  }
  if (!allowedMimetypes.includes(file.mimetype)) {
    return { valid: false, error: 'Format non supporté. PDF ou DOCX uniquement.' }
  }
  return { valid: true }
}
