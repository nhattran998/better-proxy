import {
  BaseProviderAdapter,
  type ProviderCredentials,
} from "../../domain/provider.interface";
import type { ChatRequest } from "#/shared/schemas/chat.schema";

export class GlmAdapter extends BaseProviderAdapter {
  readonly id = "glm";
  readonly name = "GLM Coding Plan";
  readonly authType = "api_key" as const;
  readonly baseUrl = "https://open.bigmodel.cn/api/paas/v4";
  readonly models = ["glm-4", "glm-4-flash", "glm-4-air", "codegeex-4"];

  async chat(request: ChatRequest, credentials: ProviderCredentials): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.getHeaders(credentials),
      body: JSON.stringify(this.transformRequest(request)),
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
      body: JSON.stringify({ ...this.transformRequest(request), stream: true }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`GLM API error: ${response.status}`);
    }

    return response.body;
  }

  async listModels(_credentials: ProviderCredentials): Promise<string[]> {
    // GLM doesn't have a models endpoint
    return this.models;
  }

  async validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    if (!credentials.apiKey) return false;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: this.getHeaders(credentials),
        body: JSON.stringify({
          model: "glm-4-flash",
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 1,
        }),
      });
      return response.ok || response.status === 400;
    } catch {
      return false;
    }
  }

  private transformRequest(request: ChatRequest): any {
    // GLM uses slightly different parameter names
    const transformed: any = {
      model: request.model,
      messages: request.messages,
      stream: request.stream ?? false,
    };

    if (request.max_tokens) transformed.max_tokens = request.max_tokens;
    if (request.temperature !== undefined) transformed.temperature = request.temperature;
    if (request.top_p !== undefined) transformed.top_p = request.top_p;
    if (request.tools) transformed.tools = request.tools;

    return transformed;
  }

  private getHeaders(credentials: ProviderCredentials): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credentials.apiKey || ""}`,
    };
  }
}
