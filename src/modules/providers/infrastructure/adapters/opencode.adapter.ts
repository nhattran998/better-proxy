import {
  BaseProviderAdapter,
  type ProviderCredentials,
} from "../../domain/provider.interface";
import type { ChatRequest } from "#/shared/schemas/chat.schema";

export class OpenCodeAdapter extends BaseProviderAdapter {
  readonly id = "opencode";
  readonly name = "OpenCode";
  readonly authType = "none" as const;
  readonly baseUrl = "https://opencode.ai/zen/v1";
  readonly models = ["opencode-latest"];

  private cachedModels: string[] | null = null;

  async chat(request: ChatRequest, _credentials: ProviderCredentials): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...request, stream: false }),
    });
    return response;
  }

  async chatStream(
    request: ChatRequest,
    _credentials: ProviderCredentials
  ): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`OpenCode API error: ${response.status}`);
    }

    return response.body;
  }

  async listModels(_credentials: ProviderCredentials): Promise<string[]> {
    if (this.cachedModels) return this.cachedModels;

    try {
      const response = await fetch(`${this.baseUrl}/models`);
      if (!response.ok) return this.models;

      const data = await response.json();
      const models = (data.data || []).map((m: any) => m.id);
      this.cachedModels = models;
      return models;
    } catch {
      return this.models;
    }
  }

  async validateCredentials(_credentials: ProviderCredentials): Promise<boolean> {
    // No auth required
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
