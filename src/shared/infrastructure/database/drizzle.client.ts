import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database as BunDatabase } from 'bun:sqlite';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import * as schema from './schema';

function getDbPath(): string {
  const dataPath = process.env.DATABASE_DATA_PATH || './volumes';
  return `${dataPath}/proxy-agent.db`;
}

function initDatabase() {
  const dbPath = getDbPath();
  const dir = dirname(dbPath);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const sqlite = new BunDatabase(dbPath);
  return drizzle(sqlite, { schema });
}

export const db = initDatabase();
export type DbClient = typeof db;
