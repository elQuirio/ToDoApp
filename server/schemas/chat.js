import { z } from 'zod';

export const sendMessageSchema = z.object({
    message: z.object({
        conversationId: z.string().uuid(),
        userText: z.string().trim().min(1).max(2000),
    }),
});