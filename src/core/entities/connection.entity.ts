export interface Connection {
  id: string;
  providerId: string;
  displayName: string;
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  isActive: boolean;
  lastUsedAt?: Date;
  priority: number;
}
