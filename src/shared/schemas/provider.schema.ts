import { z } from 'zod';

export const ProviderNameSchema = z.enum(['claude', 'codex', 'opencode', 'deepseek', 'glm']);

export const AuthTypeSchema = z.enum(['api_key', 'oauth', 'none']);

export const ProviderSchema = z.object({
  id: z.string().uuid(),
  name: ProviderNameSchema,
  authType: AuthTypeSchema,
  isActive: z.boolean().default(true),
  createdAt: z.date(),
});

export const ConnectionSchema = z.object({
  id: z.string().uuid(),
  providerId: z.string().uuid(),
  displayName: z.string().min(1),
  apiKey: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
  isActive: z.boolean().default(true),
  priority: z.number().int().default(0),
});

export const CreateConnectionSchema = ConnectionSchema.omit({ id: true });

export const ComboSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  models: z.array(z.string()),
  strategy: z.enum(['fallback', 'round-robin']).default('fallback'),
  isActive: z.boolean().default(true),
});

export const CreateComboSchema = ComboSchema.omit({ id: true });

export type ProviderName = z.infer<typeof ProviderNameSchema>;
export type AuthType = z.infer<typeof AuthTypeSchema>;
export type ProviderOutput = z.infer<typeof ProviderSchema>;
export type ConnectionInput = z.infer<typeof CreateConnectionSchema>;
export type ConnectionOutput = z.infer<typeof ConnectionSchema>;
export type ComboInput = z.infer<typeof CreateComboSchema>;
export type ComboOutput = z.infer<typeof ComboSchema>;
