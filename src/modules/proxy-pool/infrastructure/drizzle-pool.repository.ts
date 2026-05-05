import { eq } from 'drizzle-orm';
import { db } from '#/shared/infrastructure/database/drizzle.client';
import { proxyPools } from '#/shared/infrastructure/database/schema';
import type { ProxyPool, IProxyPoolRepository } from '#/core/ports/repositories/proxy-pool.repository';
import { generateId } from '#/shared/utils';

export class DrizzleProxyPoolRepository implements IProxyPoolRepository {
  async findById(id: string): Promise<ProxyPool | null> {
    const result = await db.query.proxyPools.findFirst({
      where: eq(proxyPools.id, id),
    });
    return result ? this.toEntity(result) : null;
  }

  async findAll(): Promise<ProxyPool[]> {
    const results = await db.select().from(proxyPools);
    return results.map((r) => this.toEntity(r));
  }

  async findActive(): Promise<ProxyPool[]> {
    const results = await db
      .select()
      .from(proxyPools)
      .where(eq(proxyPools.isActive, true));
    return results.map((r) => this.toEntity(r));
  }

  async create(pool: Omit<ProxyPool, 'id'>): Promise<ProxyPool> {
    const id = generateId();

    await db.insert(proxyPools).values({
      id,
      name: pool.name,
      proxies: pool.proxies,
      strategy: pool.strategy,
      isActive: pool.isActive,
    });

    return { id, ...pool };
  }

  async update(id: string, data: Partial<ProxyPool>): Promise<void> {
    await db
      .update(proxyPools)
      .set({
        name: data.name,
        proxies: data.proxies,
        strategy: data.strategy,
        isActive: data.isActive,
      })
      .where(eq(proxyPools.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(proxyPools).where(eq(proxyPools.id, id));
  }

  private toEntity(row: typeof proxyPools.$inferSelect): ProxyPool {
    return {
      id: row.id,
      name: row.name,
      proxies: row.proxies ?? [],
      strategy: (row.strategy as 'round-robin' | 'random') ?? 'round-robin',
      isActive: row.isActive ?? true,
    };
  }
}
