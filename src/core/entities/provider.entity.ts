export type ProviderName = 'claude' | 'codex' | 'opencode' | 'deepseek' | 'glm';
export type AuthType = 'api_key' | 'oauth' | 'none';

export interface Provider {
  id: string;
  name: ProviderName;
  authType: AuthType;
  isActive: boolean;
  createdAt: Date;
}
