import { z } from 'zod'

export const createOfferSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  location: z.string().optional(),
  durationMonths: z.number().int().positive().optional(),
  remote: z.boolean().default(false),
  skills: z.array(z.string()).min(1),
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
