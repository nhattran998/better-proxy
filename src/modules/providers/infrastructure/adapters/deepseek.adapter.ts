import {
  BaseProviderAdapter,
  type ProviderCredentials,
} from "../../domain/provider.interface";
import type { ChatRequest } from "#/shared/schemas/chat.schema";

export class DeepseekAdapter extends BaseProviderAdapter {
  readonly id = "deepseek";
  readonly name = "Deepseek";
  readonly authType = "api_key" as const;
  readonly baseUrl = "https://api.deepseek.com/v1";
  readonly models = ["deepseek-chat", "deepseek-coder", "deepseek-reasoner"];

  async chat(request: ChatRequest, credentials: ProviderCredentials): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.getHeaders(credentials),
      body: JSON.stringify({ ...request, stream: false }),
    });
    return response;
  }

  async chatStream(
    request: ChatRequest,
    credentials: ProviderCredentials
  ): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.getHeaders(credentials),
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Deepseek API error: ${response.status}`);
    }

    return response.body;
  }

  async listModels(credentials: ProviderCredentials): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.getHeaders(credentials),
      });
      if (!response.ok) return this.models;

      const data = await response.json();
      return (data.data || []).map((m: any) => m.id);
    } catch {
      return this.models;
    }
  }

  async validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    if (!credentials.apiKey) return false;

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.getHeaders(credentials),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private getHeaders(credentials: ProviderCredentials): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credentials.apiKey || ""}`,
    };
  }
}
