import { z } from 'zod'

export const createOfferSchema = z.object({
  title: z.string().trim().min(3).max(255),
  description: z.string().trim().min(10),
  companyId: z.string().uuid().optional(),
  location: z.string().trim().optional(),
  type: z.enum(['full-time', 'internship', 'remote']).optional(),
  durationMonths: z.number().int().positive().optional(),
  remote: z.boolean().default(false),
  skills: z.array(z.string().trim().min(1)).default([]),
})

export const updateOfferSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(10).optional(),
  location: z.string().optional(),
  durationMonths: z.number().int().positive().optional(),
  remote: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
})

export type CreateOfferInput = z.infer<typeof createOfferSchema>
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>
