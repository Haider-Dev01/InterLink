import { z } from 'zod';

export const sendMessageSchema = z.object({
  question: z
    .string()
    .min(2, 'La question doit contenir au moins 2 caractères')
    .max(500, 'La question ne peut pas dépasser 500 caractères'),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
