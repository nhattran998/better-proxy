import { eq, between, and } from 'drizzle-orm';
import { db } from '#/shared/infrastructure/database/drizzle.client';
import { usage } from '#/shared/infrastructure/database/schema';
import type {
  UsageRecord,
  UsageStats,
  UsageFilter,
  IUsageRepository,
} from '#/core/ports/repositories/usage.repository';
import { generateId } from '#/shared/utils';

export class DrizzleUsageRepository implements IUsageRepository {
  async create(record: Omit<UsageRecord, 'id'>): Promise<UsageRecord> {
    const id = generateId();

    await db.insert(usage).values({
      id,
      connectionId: record.connectionId,
      model: record.model,
      inputTokens: record.inputTokens,
      outputTokens: record.outputTokens,
      totalTokens: record.totalTokens,
      cost: record.cost,
      createdAt: record.createdAt,
    });

    return { id, ...record };
  }

  async findByConnection(connectionId: string): Promise<UsageRecord[]> {
    const results = await db
      .select()
      .from(usage)
      .where(eq(usage.connectionId, connectionId));
    return results.map((r) => this.toEntity(r));
  }

  async aggregateStats(filter: UsageFilter): Promise<UsageStats> {
    const conditions = [];

    if (filter.connectionId) {
      conditions.push(eq(usage.connectionId, filter.connectionId));
    }
    if (filter.from && filter.to) {
      conditions.push(between(usage.createdAt, filter.from, filter.to));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db.select().from(usage).where(whereClause);

    return this.computeStats(results.map((r) => this.toEntity(r)));
  }

  private computeStats(records: UsageRecord[]): UsageStats {
    const byProvider: Record<string, { tokens: number; cost: number }> = {};
    const byModel: Record<string, { tokens: number; cost: number }> = {};
    let totalTokens = 0;
    let totalCost = 0;

    for (const r of records) {
      totalTokens += r.totalTokens;
      totalCost += r.cost;

      const provider = r.model.split('/')[0] ?? 'unknown';

      if (!byProvider[provider]) {
        byProvider[provider] = { tokens: 0, cost: 0 };
      }
      byProvider[provider].tokens += r.totalTokens;
      byProvider[provider].cost += r.cost;

      if (!byModel[r.model]) {
        byModel[r.model] = { tokens: 0, cost: 0 };
      }
      byModel[r.model].tokens += r.totalTokens;
      byModel[r.model].cost += r.cost;
    }

    return { totalTokens, totalCost, byProvider, byModel };
  }

  private toEntity(row: typeof usage.$inferSelect): UsageRecord {
    return {
      id: row.id,
      connectionId: row.connectionId ?? '',
      model: row.model,
      inputTokens: row.inputTokens ?? 0,
      outputTokens: row.outputTokens ?? 0,
      totalTokens: row.totalTokens ?? 0,
      cost: row.cost ?? 0,
      createdAt: row.createdAt ?? new Date(),
    };
  }
}
