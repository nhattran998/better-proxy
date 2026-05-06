import {
  BaseProviderAdapter,
  type ProviderCredentials,
} from "../../domain/provider.interface";
import type { ChatRequest } from "#/shared/schemas/chat.schema";
import {
  openaiToClaudeRequest,
  claudeToOpenaiResponse,
  claudeStreamToOpenai,
  type ClaudeResponse,
  type ClaudeStreamEvent,
} from "#/modules/proxy/domain/translator";

export class ClaudeAdapter extends BaseProviderAdapter {
  readonly id = "claude";
  readonly name = "Claude (Anthropic)";
  readonly authType = "api_key" as const;
  readonly baseUrl = "https://api.anthropic.com/v1";
  readonly models = [
    "claude-opus-4-20250514",
    "claude-sonnet-4-20250514",
    "claude-haiku-4-20250514",
  ];

  private readonly apiVersion = "2023-06-01";

  async chat(request: ChatRequest, credentials: ProviderCredentials): Promise<Response> {
    const claudeRequest = openaiToClaudeRequest(request as any);

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: this.getHeaders(credentials),
      body: JSON.stringify({ ...claudeRequest, stream: false }),
    });

    if (!response.ok) {
      return response;
    }

    const claudeResponse = (await response.json()) as ClaudeResponse;
    const openaiResponse = claudeToOpenaiResponse(claudeResponse);

    return new Response(JSON.stringify(openaiResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async chatStream(
    request: ChatRequest,
    credentials: ProviderCredentials
  ): Promise<ReadableStream<Uint8Array>> {
    const claudeRequest = openaiToClaudeRequest(request as any);

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: this.getHeaders(credentials),
      body: JSON.stringify({ ...claudeRequest, stream: true }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let messageId = "";
    let model = claudeRequest.model;

    return new ReadableStream({
      async pull(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data || data === "[DONE]") continue;

            try {
              const event = JSON.parse(data) as ClaudeStreamEvent;

              if (event.type === "message_start" && event.message) {
                messageId = event.message.id || `msg_${Date.now()}`;
                model = event.message.model || model;
              }

              const chunk = claudeStreamToOpenai(event, messageId, model);
              if (chunk) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
                );
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      },
    });
  }

  async validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    if (!credentials.apiKey) return false;

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: this.getHeaders(credentials),
        body: JSON.stringify({
          model: this.models[0],
          max_tokens: 1,
          messages: [{ role: "user", content: "Hi" }],
        }),
      });
      return response.ok || response.status === 400; // 400 = valid key, just bad request
    } catch {
      return false;
    }
  }

  private getHeaders(credentials: ProviderCredentials): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "x-api-key": credentials.apiKey || "",
      "anthropic-version": this.apiVersion,
    };
  }
}
