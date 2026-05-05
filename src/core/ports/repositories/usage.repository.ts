export interface UsageRecord {
  id: string;
  connectionId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  createdAt: Date;
}

export interface UsageStats {
  totalTokens: number;
  totalCost: number;
  byProvider: Record<string, { tokens: number; cost: number }>;
  byModel: Record<string, { tokens: number; cost: number }>;
}

export interface UsageFilter {
  connectionId?: string;
  from?: Date;
  to?: Date;
}

export interface IUsageRepository {
  create(record: Omit<UsageRecord, 'id'>): Promise<UsageRecord>;
  findByConnection(connectionId: string): Promise<UsageRecord[]>;
  aggregateStats(filter: UsageFilter): Promise<UsageStats>;
}
