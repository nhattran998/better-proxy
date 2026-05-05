import type { Provider, ProviderName } from '@/core/entities';

export interface IProviderRepository {
  findById(id: string): Promise<Provider | null>;
  findByName(name: ProviderName): Promise<Provider | null>;
  findAll(): Promise<Provider[]>;
  findActive(): Promise<Provider[]>;
  create(provider: Omit<Provider, 'id' | 'createdAt'>): Promise<Provider>;
  update(id: string, data: Partial<Provider>): Promise<void>;
  delete(id: string): Promise<void>;
}
