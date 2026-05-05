import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).default('user'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const providers = sqliteTable('providers', {
  id: text('id').primaryKey(),
  name: text('name', { enum: ['claude', 'codex', 'opencode', 'deepseek', 'glm'] }).notNull(),
  authType: text('auth_type', { enum: ['api_key', 'oauth', 'none'] }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const connections = sqliteTable('connections', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').references(() => providers.id),
  displayName: text('display_name').notNull(),
  apiKey: text('api_key'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  priority: integer('priority').default(0),
});

export const combos = sqliteTable('combos', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  models: text('models', { mode: 'json' }).$type<string[]>(),
  strategy: text('strategy', { enum: ['fallback', 'round-robin'] }).default('fallback'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  token: text('token').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const usage = sqliteTable('usage', {
  id: text('id').primaryKey(),
  connectionId: text('connection_id').references(() => connections.id),
  model: text('model').notNull(),
  inputTokens: integer('input_tokens').default(0),
  outputTokens: integer('output_tokens').default(0),
  totalTokens: integer('total_tokens').default(0),
  cost: real('cost').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const quota = sqliteTable('quota', {
  id: text('id').primaryKey(),
  connectionId: text('connection_id').references(() => connections.id),
  provider: text('provider').notNull(),
  usedTokens: integer('used_tokens').default(0),
  limitTokens: integer('limit_tokens'),
  resetAt: integer('reset_at', { mode: 'timestamp' }),
  resetType: text('reset_type', { enum: ['5h', 'daily', 'weekly', 'monthly'] }),
});

export const proxyPools = sqliteTable('proxy_pools', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  proxies: text('proxies', { mode: 'json' }).$type<string[]>(),
  strategy: text('strategy', { enum: ['round-robin', 'random'] }).default('round-robin'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const rateLimits = sqliteTable('rate_limits', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  requests: integer('requests').default(0),
  windowStart: integer('window_start', { mode: 'timestamp' }),
  blockedUntil: integer('blocked_until', { mode: 'timestamp' }),
});
