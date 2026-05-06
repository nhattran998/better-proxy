import { describe, it, expect } from "vitest";
import {
  openaiToClaudeRequest,
  claudeToOpenaiResponse,
} from "#/modules/proxy/domain/translator";

describe("OpenAI to Claude Translator", () => {
  it("should convert simple chat request", () => {
    const openaiRequest = {
      model: "gpt-4",
      messages: [
        { role: "system" as const, content: "You are helpful." },
        { role: "user" as const, content: "Hello" },
      ],
      max_tokens: 100,
    };

    const claude = openaiToClaudeRequest(openaiRequest as any);

    expect(claude.system).toBe("You are helpful.");
    expect(claude.messages).toHaveLength(1);
    expect(claude.messages[0].role).toBe("user");
    expect(claude.messages[0].content).toBe("Hello");
    expect(claude.max_tokens).toBe(100);
  });

  it("should merge consecutive same-role messages", () => {
    const openaiRequest = {
      model: "gpt-4",
      messages: [
        { role: "user" as const, content: "Hello" },
        { role: "user" as const, content: "How are you?" },
      ],
      max_tokens: 100,
    };

    const claude = openaiToClaudeRequest(openaiRequest as any);

    expect(claude.messages).toHaveLength(1);
    expect(claude.messages[0].role).toBe("user");
  });

  it("should convert tools", () => {
    const openaiRequest = {
      model: "gpt-4",
      messages: [{ role: "user" as const, content: "Get weather" }],
      max_tokens: 100,
      tools: [
        {
          type: "function",
          function: {
            name: "get_weather",
            description: "Get the weather",
            parameters: { type: "object", properties: {} },
          },
        },
      ],
    };

    const claude = openaiToClaudeRequest(openaiRequest as any);

    expect(claude.tools).toHaveLength(1);
    expect(claude.tools![0].name).toBe("get_weather");
  });
});

describe("Claude to OpenAI Response Translator", () => {
  it("should convert text response", () => {
    const claudeResponse = {
      id: "msg_123",
      type: "message" as const,
      role: "assistant" as const,
      content: [{ type: "text" as const, text: "Hello there!" }],
      model: "claude-sonnet-4",
      stop_reason: "end_turn",
      usage: { input_tokens: 10, output_tokens: 5 },
    };

    const openai = claudeToOpenaiResponse(claudeResponse);

    expect(openai.id).toBe("msg_123");
    expect(openai.object).toBe("chat.completion");
    expect(openai.choices[0].message.content).toBe("Hello there!");
    expect(openai.choices[0].finish_reason).toBe("stop");
    expect(openai.usage?.total_tokens).toBe(15);
  });

  it("should convert tool use response", () => {
    const claudeResponse = {
      id: "msg_123",
      type: "message" as const,
      role: "assistant" as const,
      content: [
        {
          type: "tool_use" as const,
          id: "tool_1",
          name: "get_weather",
          input: { city: "Tokyo" },
        },
      ],
      model: "claude-sonnet-4",
      stop_reason: "tool_use",
      usage: { input_tokens: 10, output_tokens: 20 },
    };

    const openai = claudeToOpenaiResponse(claudeResponse);

    expect(openai.choices[0].message.tool_calls).toHaveLength(1);
    expect(openai.choices[0].message.tool_calls![0].function.name).toBe("get_weather");
    expect(openai.choices[0].finish_reason).toBe("tool_calls");
  });
});
