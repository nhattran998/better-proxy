export interface ProxyPool {
  id: string;
  name: string;
  proxies: string[];
  strategy: 'round-robin' | 'random';
  isActive: boolean;
}

export interface IProxyPoolRepository {
  findById(id: string): Promise<ProxyPool | null>;
  findAll(): Promise<ProxyPool[]>;
  findActive(): Promise<ProxyPool[]>;
  create(pool: Omit<ProxyPool, 'id'>): Promise<ProxyPool>;
  update(id: string, data: Partial<ProxyPool>): Promise<void>;
  delete(id: string): Promise<void>;
}
