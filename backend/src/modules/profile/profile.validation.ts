import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').optional(),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  bio: z.string().max(500, 'La bio ne doit pas dépasser 500 caractères').optional(),
  linkedinUrl: z.string().url('URL LinkedIn invalide').optional(),
  githubUsername: z.string().optional(),
  location: z.string().optional(),
  availabilityMonths: z.number().int().positive().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
