import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_DATA_PATH: z.string().default('./volumes'),

  JWT_SECRET: z.string().min(32).default('dev-secret-change-in-production-32chars'),

  OIDC_ENABLED: z.coerce.boolean().default(false),
  KEYCLOAK_URL: z.string().url().optional(),
  KEYCLOAK_REALM: z.string().optional(),
  OIDC_CLIENT_ID: z.string().optional(),
  OIDC_CLIENT_SECRET: z.string().optional(),
  OIDC_REDIRECT_URI: z.string().url().optional(),

  RTK_ENABLED: z.coerce.boolean().default(true),
  CAVEMAN_ENABLED: z.coerce.boolean().default(false),
  CAVEMAN_LEVEL: z.enum(['light', 'medium', 'full']).default('full'),

  MITM_ENABLED: z.coerce.boolean().default(false),
  MITM_PORT: z.coerce.number().default(8443),
  MITM_CA_PATH: z.string().default('./volumes/ca'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(60),
});

function loadEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .filter((i) => i.code === 'invalid_type')
      .map((i) => i.path.join('.'));

    if (missing.length > 0) {
      console.error(`Missing/invalid env vars: ${missing.join(', ')}`);
    }

    console.error('Env validation errors:', result.error.format());
    throw new Error('Invalid environment configuration');
  }

  return result.data;
}

export const env = loadEnv();
export type Env = z.infer<typeof envSchema>;
