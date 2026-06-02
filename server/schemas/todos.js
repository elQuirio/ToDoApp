import { z } from 'zod';

const todoBaseSchema = z.object({
    id: z.string().uuid(),
    text: z.string().trim().min(1).max(500),
    status: z.enum(['active', 'completed']),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
    toBeCompletedAt: z.number().int().positive().nullable().optional(),
});

export const createTodoSchema = todoBaseSchema;


export const updateTodoSchema = todoBaseSchema.partial();

export const resortSchema = z.object({
    sortBy: z.enum(['manual', 'createdAt', 'updatedAt', 'alpha']),
    sortDirection: z.enum(['asc', 'desc']),
});

export const reorderSchema = z.object({
    fromId: z.string().uuid(),
    toId: z.string().uuid(),
});

export const markAllParamsSchema = z.object({
    status: z.enum(['active', 'completed']),
});

export const clearTodosQuerySchema = z.object({
    status: z.enum(['all', 'completed']),
});