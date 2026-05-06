import {
  BaseProviderAdapter,
  type ProviderCredentials,
} from "../../domain/provider.interface";
import type { ChatRequest } from "#/shared/schemas/chat.schema";

export class CodexAdapter extends BaseProviderAdapter {
  readonly id = "codex";
  readonly name = "Codex (OpenAI)";
  readonly authType = "oauth" as const;
  readonly baseUrl = "https://api.openai.com/v1";
  readonly models = ["gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo", "o1", "o1-mini"];

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
      throw new Error(`Codex API error: ${response.status}`);
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
      return (data.data || [])
        .filter((m: any) => m.id.includes("gpt") || m.id.includes("o1"))
        .map((m: any) => m.id);
    } catch {
      return this.models;
    }
  }

  async validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    if (!credentials.accessToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.getHeaders(credentials),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async refreshToken(credentials: ProviderCredentials): Promise<ProviderCredentials> {
    if (!credentials.refreshToken) {
      throw new Error("No refresh token available");
    }

    // OpenAI OAuth PKCE token refresh
    const response = await fetch("https://auth.openai.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: credentials.refreshToken,
        client_id: "codex-cli",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    return {
      ...credentials,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || credentials.refreshToken,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
    };
  }

  private getHeaders(credentials: ProviderCredentials): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credentials.accessToken || credentials.apiKey || ""}`,
    };
  }
}
