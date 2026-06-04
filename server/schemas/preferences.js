import { z } from 'zod';

export const updatePreferencesSchema = z.object({
    sortBy: z.enum(['manual', 'createdAt', 'updatedAt', 'alpha']).optional(),
    sortDirection: z.enum(['asc', 'desc']).optional(),
    isLightMode: z.boolean().optional(),
    todoViewMode: z.enum(['all', 'active', 'completed']).optional(),
    mainView: z.enum(['todo', 'chat']).optional(),
}).strict();
