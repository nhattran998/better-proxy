import { eq, and, desc } from 'drizzle-orm';
import { db } from '#/shared/infrastructure/database/drizzle.client';
import { connections } from '#/shared/infrastructure/database/schema';
import type { Connection } from '#/core/entities';
import type { IConnectionRepository } from '#/core/ports/repositories/connection.repository';
import { generateId } from '#/shared/utils';

export class DrizzleConnectionRepository implements IConnectionRepository {
  async findById(id: string): Promise<Connection | null> {
    const result = await db.query.connections.findFirst({
      where: eq(connections.id, id),
    });
    return result ? this.toEntity(result) : null;
  }

  async findByProvider(providerId: string): Promise<Connection[]> {
    const results = await db
      .select()
      .from(connections)
      .where(eq(connections.providerId, providerId))
      .orderBy(connections.priority);
    return results.map((r) => this.toEntity(r));
  }

  async findActiveByProvider(providerId: string): Promise<Connection[]> {
    const results = await db
      .select()
      .from(connections)
      .where(
        and(eq(connections.providerId, providerId), eq(connections.isActive, true))
      )
      .orderBy(connections.priority);
    return results.map((r) => this.toEntity(r));
  }

  async getActiveCredentials(providerId: string): Promise<Connection | null> {
    const result = await db.query.connections.findFirst({
      where: and(
        eq(connections.providerId, providerId),
        eq(connections.isActive, true)
      ),
      orderBy: [connections.priority, desc(connections.lastUsedAt)],
    });
    return result ? this.toEntity(result) : null;
  }

  async create(conn: Omit<Connection, 'id'>): Promise<Connection> {
    const id = generateId();

    await db.insert(connections).values({
      id,
      providerId: conn.providerId,
      displayName: conn.displayName,
      apiKey: conn.apiKey,
      accessToken: conn.accessToken,
      refreshToken: conn.refreshToken,
      expiresAt: conn.expiresAt,
      isActive: conn.isActive,
      lastUsedAt: conn.lastUsedAt,
      priority: conn.priority,
    });

    return { id, ...conn };
  }

  async update(id: string, data: Partial<Connection>): Promise<void> {
    await db
      .update(connections)
      .set({
        displayName: data.displayName,
        apiKey: data.apiKey,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        isActive: data.isActive,
        lastUsedAt: data.lastUsedAt,
        priority: data.priority,
      })
      .where(eq(connections.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(connections).where(eq(connections.id, id));
  }

  async updateLastUsed(id: string): Promise<void> {
    await db
      .update(connections)
      .set({ lastUsedAt: new Date() })
      .where(eq(connections.id, id));
  }

  private toEntity(row: typeof connections.$inferSelect): Connection {
    return {
      id: row.id,
      providerId: row.providerId ?? '',
      displayName: row.displayName,
      apiKey: row.apiKey ?? undefined,
      accessToken: row.accessToken ?? undefined,
      refreshToken: row.refreshToken ?? undefined,
      expiresAt: row.expiresAt ?? undefined,
      isActive: row.isActive ?? true,
      lastUsedAt: row.lastUsedAt ?? undefined,
      priority: row.priority ?? 0,
    };
  }
}
