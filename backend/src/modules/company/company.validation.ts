import { z } from 'zod';

export const registerCompanySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  industry: z.string().optional(),
  siteWeb: z.string().url('URL de site web invalide').optional(),
});

export const rejectCompanySchema = z.object({
  reason: z.string().min(1, 'La raison du rejet est requise'),
});

export type RegisterCompanyDto = z.infer<typeof registerCompanySchema>;
export type RejectCompanyDto = z.infer<typeof rejectCompanySchema>;
