import type { ChatRequest } from "#/shared/schemas/chat.schema";

export interface ProviderCredentials {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface ProviderConfig {
  baseUrl: string;
  timeout?: number;
}

export interface IProviderAdapter {
  readonly id: string;
  readonly name: string;
  readonly authType: "api_key" | "oauth" | "none";
  readonly models: string[];

  chat(request: ChatRequest, credentials: ProviderCredentials): Promise<Response>;

  chatStream(
    request: ChatRequest,
    credentials: ProviderCredentials
  ): Promise<ReadableStream<Uint8Array>>;

  listModels(credentials: ProviderCredentials): Promise<string[]>;

  validateCredentials(credentials: ProviderCredentials): Promise<boolean>;

  refreshToken?(credentials: ProviderCredentials): Promise<ProviderCredentials>;
}

export abstract class BaseProviderAdapter implements IProviderAdapter {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly authType: "api_key" | "oauth" | "none";
  abstract readonly models: string[];
  abstract readonly baseUrl: string;

  protected timeout = 60_000;

  abstract chat(
    request: ChatRequest,
    credentials: ProviderCredentials
  ): Promise<Response>;

  abstract chatStream(
    request: ChatRequest,
    credentials: ProviderCredentials
  ): Promise<ReadableStream<Uint8Array>>;

  async listModels(_credentials: ProviderCredentials): Promise<string[]> {
    return this.models;
  }

  abstract validateCredentials(credentials: ProviderCredentials): Promise<boolean>;

  protected getAuthHeaders(credentials: ProviderCredentials): Record<string, string> {
    if (this.authType === "api_key" && credentials.apiKey) {
      return { Authorization: `Bearer ${credentials.apiKey}` };
    }
    if (this.authType === "oauth" && credentials.accessToken) {
      return { Authorization: `Bearer ${credentials.accessToken}` };
    }
    return {};
  }
}
