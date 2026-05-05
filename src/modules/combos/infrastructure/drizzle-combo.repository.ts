import { eq } from 'drizzle-orm';
import { db } from '#/shared/infrastructure/database/drizzle.client';
import { combos } from '#/shared/infrastructure/database/schema';
import type { Combo } from '#/core/entities';
import type { IComboRepository } from '#/core/ports/repositories/combo.repository';
import { generateId } from '#/shared/utils';

export class DrizzleComboRepository implements IComboRepository {
  async findById(id: string): Promise<Combo | null> {
    const result = await db.query.combos.findFirst({
      where: eq(combos.id, id),
    });
    return result ? this.toEntity(result) : null;
  }

  async findByName(name: string): Promise<Combo | null> {
    const result = await db.query.combos.findFirst({
      where: eq(combos.name, name),
    });
    return result ? this.toEntity(result) : null;
  }

  async findAll(): Promise<Combo[]> {
    const results = await db.select().from(combos);
    return results.map((r) => this.toEntity(r));
  }

  async findActive(): Promise<Combo[]> {
    const results = await db
      .select()
      .from(combos)
      .where(eq(combos.isActive, true));
    return results.map((r) => this.toEntity(r));
  }

  async create(combo: Omit<Combo, 'id'>): Promise<Combo> {
    const id = generateId();

    await db.insert(combos).values({
      id,
      name: combo.name,
      models: combo.models,
      strategy: combo.strategy,
      isActive: combo.isActive,
    });

    return { id, ...combo };
  }

  async update(id: string, data: Partial<Combo>): Promise<void> {
    await db
      .update(combos)
      .set({
        name: data.name,
        models: data.models,
        strategy: data.strategy,
        isActive: data.isActive,
      })
      .where(eq(combos.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(combos).where(eq(combos.id, id));
  }

  private toEntity(row: typeof combos.$inferSelect): Combo {
    return {
      id: row.id,
      name: row.name,
      models: row.models ?? [],
      strategy: (row.strategy as 'fallback' | 'round-robin') ?? 'fallback',
      isActive: row.isActive ?? true,
    };
  }
}
