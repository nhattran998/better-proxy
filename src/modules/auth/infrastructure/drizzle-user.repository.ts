import { eq } from 'drizzle-orm';
import { db } from '#/shared/infrastructure/database/drizzle.client';
import { users } from '#/shared/infrastructure/database/schema';
import type { User } from '#/core/entities';
import type { IUserRepository } from '#/core/ports/repositories/user.repository';
import { generateId } from '#/shared/utils';

export class DrizzleUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result ? this.toEntity(result) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    return result ? this.toEntity(result) : null;
  }

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const id = generateId();
    const now = new Date();

    await db.insert(users).values({
      id,
      username: user.username,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: now,
    });

    return {
      id,
      ...user,
      createdAt: now,
    };
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    await db
      .update(users)
      .set({
        username: data.username,
        passwordHash: data.passwordHash,
        role: data.role,
      })
      .where(eq(users.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  private toEntity(row: typeof users.$inferSelect): User {
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.passwordHash,
      role: (row.role as 'admin' | 'user') ?? 'user',
      createdAt: row.createdAt ?? new Date(),
    };
  }
}
