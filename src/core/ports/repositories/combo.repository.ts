import type { Combo } from '#/core/entities';

export interface IComboRepository {
  findById(id: string): Promise<Combo | null>;
  findByName(name: string): Promise<Combo | null>;
  findAll(): Promise<Combo[]>;
  findActive(): Promise<Combo[]>;
  create(combo: Omit<Combo, 'id'>): Promise<Combo>;
  update(id: string, data: Partial<Combo>): Promise<void>;
  delete(id: string): Promise<void>;
}
