export interface QuotaRecord {
  id: string;
  connectionId: string;
  provider: string;
  usedTokens: number;
  limitTokens: number | null;
  resetAt: Date | null;
  resetType: '5h' | 'daily' | 'weekly' | 'monthly' | null;
}

export interface IQuotaRepository {
  findByConnectionId(connectionId: string): Promise<QuotaRecord | null>;
  create(quota: Omit<QuotaRecord, 'id'>): Promise<QuotaRecord>;
  update(id: string, data: Partial<QuotaRecord>): Promise<void>;
  incrementUsedTokens(connectionId: string, tokens: number): Promise<void>;
  resetQuota(connectionId: string): Promise<void>;
}
