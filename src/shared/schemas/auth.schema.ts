import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  role: z.enum(['admin', 'user']).default('user'),
  createdAt: z.date(),
});

export const SessionSchema = z.object({
  sub: z.string().uuid(),
  exp: z.number().optional(),
  iat: z.number().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type UserOutput = z.infer<typeof UserSchema>;
export type SessionPayload = z.infer<typeof SessionSchema>;
