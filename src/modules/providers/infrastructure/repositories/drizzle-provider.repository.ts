import { eq } from 'drizzle-orm';
import { db } from '#/shared/infrastructure/database/drizzle.client';
import { providers } from '#/shared/infrastructure/database/schema';
import type { Provider, ProviderName } from '#/core/entities';
import type { IProviderRepository } from '#/core/ports/repositories/provider.repository';
import { generateId } from '#/shared/utils';

export class DrizzleProviderRepository implements IProviderRepository {
  async findById(id: string): Promise<Provider | null> {
    const result = await db.query.providers.findFirst({
      where: eq(providers.id, id),
    });
    return result ? this.toEntity(result) : null;
  }

  async findByName(name: ProviderName): Promise<Provider | null> {
    const result = await db.query.providers.findFirst({
      where: eq(providers.name, name),
    });
    return result ? this.toEntity(result) : null;
  }

  async findAll(): Promise<Provider[]> {
    const results = await db.select().from(providers);
    return results.map((r) => this.toEntity(r));
  }

  async findActive(): Promise<Provider[]> {
    const results = await db
      .select()
      .from(providers)
      .where(eq(providers.isActive, true));
    return results.map((r) => this.toEntity(r));
  }

  async create(provider: Omit<Provider, 'id' | 'createdAt'>): Promise<Provider> {
    const id = generateId();
    const now = new Date();

    await db.insert(providers).values({
      id,
      name: provider.name,
      authType: provider.authType,
      isActive: provider.isActive,
      createdAt: now,
    });

    return {
      id,
      ...provider,
      createdAt: now,
    };
  }

  async update(id: string, data: Partial<Provider>): Promise<void> {
    await db
      .update(providers)
      .set({
        name: data.name,
        authType: data.authType,
        isActive: data.isActive,
      })
      .where(eq(providers.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(providers).where(eq(providers.id, id));
  }

  private toEntity(row: typeof providers.$inferSelect): Provider {
    return {
      id: row.id,
      name: row.name as ProviderName,
      authType: row.authType as 'api_key' | 'oauth' | 'none',
      isActive: row.isActive ?? true,
      createdAt: row.createdAt ?? new Date(),
    };
  }
}
