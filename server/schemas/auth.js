import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
});