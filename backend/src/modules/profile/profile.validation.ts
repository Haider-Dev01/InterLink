import { z } from 'zod';

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().optional());

export const updateProfileSchema = z.object({
  firstName: optionalTrimmedString.pipe(z.string().min(2, 'Le prenom doit contenir au moins 2 caracteres').optional()),
  lastName: optionalTrimmedString.pipe(z.string().min(2, 'Le nom doit contenir au moins 2 caracteres').optional()),
  bio: optionalTrimmedString.pipe(z.string().max(500, 'La bio ne doit pas depasser 500 caracteres').optional()),
  linkedinUrl: z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().url('URL LinkedIn invalide').optional()),
  githubUsername: optionalTrimmedString,
  location: optionalTrimmedString,
  availabilityMonths: z.number().int().positive().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
