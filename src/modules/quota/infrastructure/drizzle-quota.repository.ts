import { eq, sql } from 'drizzle-orm';
import { db } from '#/shared/infrastructure/database/drizzle.client';
import { quota } from '#/shared/infrastructure/database/schema';
import type { QuotaRecord, IQuotaRepository } from '#/core/ports/repositories/quota.repository';
import { generateId } from '#/shared/utils';

export class DrizzleQuotaRepository implements IQuotaRepository {
  async findByConnectionId(connectionId: string): Promise<QuotaRecord | null> {
    const result = await db.query.quota.findFirst({
      where: eq(quota.connectionId, connectionId),
    });
    return result ? this.toEntity(result) : null;
  }

  async create(record: Omit<QuotaRecord, 'id'>): Promise<QuotaRecord> {
    const id = generateId();

    await db.insert(quota).values({
      id,
      connectionId: record.connectionId,
      provider: record.provider,
      usedTokens: record.usedTokens,
      limitTokens: record.limitTokens,
      resetAt: record.resetAt,
      resetType: record.resetType,
    });

    return { id, ...record };
  }

  async update(id: string, data: Partial<QuotaRecord>): Promise<void> {
    await db
      .update(quota)
      .set({
        usedTokens: data.usedTokens,
        limitTokens: data.limitTokens,
        resetAt: data.resetAt,
        resetType: data.resetType,
      })
      .where(eq(quota.id, id));
  }

  async incrementUsedTokens(connectionId: string, tokens: number): Promise<void> {
    await db
      .update(quota)
      .set({ usedTokens: sql`used_tokens + ${tokens}` })
      .where(eq(quota.connectionId, connectionId));
  }

  async resetQuota(connectionId: string): Promise<void> {
    await db
      .update(quota)
      .set({ usedTokens: 0, resetAt: new Date() })
      .where(eq(quota.connectionId, connectionId));
  }

  private toEntity(row: typeof quota.$inferSelect): QuotaRecord {
    return {
      id: row.id,
      connectionId: row.connectionId ?? '',
      provider: row.provider,
      usedTokens: row.usedTokens ?? 0,
      limitTokens: row.limitTokens,
      resetAt: row.resetAt,
      resetType: row.resetType as '5h' | 'daily' | 'weekly' | 'monthly' | null,
    };
  }
}
