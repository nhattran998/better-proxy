import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/shared/infrastructure/database/schema.ts',
  out: './src/shared/infrastructure/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_DATA_PATH
      ? `${process.env.DATABASE_DATA_PATH}/proxy-agent.db`
      : './volumes/proxy-agent.db',
  },
});
