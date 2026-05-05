import type { Connection } from '#/core/entities';

export interface IConnectionRepository {
  findById(id: string): Promise<Connection | null>;
  findByProvider(providerId: string): Promise<Connection[]>;
  findActiveByProvider(providerId: string): Promise<Connection[]>;
  getActiveCredentials(providerId: string): Promise<Connection | null>;
  create(conn: Omit<Connection, 'id'>): Promise<Connection>;
  update(id: string, data: Partial<Connection>): Promise<void>;
  delete(id: string): Promise<void>;
  updateLastUsed(id: string): Promise<void>;
}
