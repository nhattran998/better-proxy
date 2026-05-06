export interface ClaudeResponse {
  id: string;
  type: "message";
  role: "assistant";
  content: ClaudeResponseContent[];
  model: string;
  stop_reason: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ClaudeResponseContent {
  type: "text" | "tool_use";
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
}

export interface OpenAIResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIChoice {
  index: number;
  message: {
    role: "assistant";
    content: string | null;
    tool_calls?: {
      id: string;
      type: "function";
      function: { name: string; arguments: string };
    }[];
  };
  finish_reason: string | null;
}

export function claudeToOpenaiResponse(claude: ClaudeResponse): OpenAIResponse {
  const textContent = claude.content
    .filter((c) => c.type === "text" && c.text)
    .map((c) => c.text!)
    .join("");

  const toolCalls = claude.content
    .filter((c) => c.type === "tool_use")
    .map((c) => ({
      id: c.id!,
      type: "function" as const,
      function: {
        name: c.name!,
        arguments: JSON.stringify(c.input || {}),
      },
    }));

  const finishReason = mapStopReason(claude.stop_reason);

  return {
    id: claude.id,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: claude.model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: textContent || null,
          ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
        },
        finish_reason: finishReason,
      },
    ],
    usage: {
      prompt_tokens: claude.usage.input_tokens,
      completion_tokens: claude.usage.output_tokens,
      total_tokens: claude.usage.input_tokens + claude.usage.output_tokens,
    },
  };
}

function mapStopReason(reason: string | null): string | null {
  if (!reason) return null;
  const mappings: Record<string, string> = {
    end_turn: "stop",
    stop_sequence: "stop",
    max_tokens: "length",
    tool_use: "tool_calls",
  };
  return mappings[reason] || reason;
}

// Streaming chunk translation
export interface ClaudeStreamEvent {
  type: string;
  message?: Partial<ClaudeResponse>;
  index?: number;
  content_block?: ClaudeResponseContent;
  delta?: {
    type: string;
    text?: string;
    partial_json?: string;
  };
  usage?: { output_tokens: number };
}

export interface OpenAIStreamChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: "assistant";
      content?: string;
      tool_calls?: {
        index: number;
        id?: string;
        type?: "function";
        function?: { name?: string; arguments?: string };
      }[];
    };
    finish_reason: string | null;
  }[];
}

export function claudeStreamToOpenai(
  event: ClaudeStreamEvent,
  messageId: string,
  model: string
): OpenAIStreamChunk | null {
  const chunk: OpenAIStreamChunk = {
    id: messageId,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, delta: {}, finish_reason: null }],
  };

  switch (event.type) {
    case "message_start":
      chunk.choices[0].delta = { role: "assistant" };
      return chunk;

    case "content_block_delta":
      if (event.delta?.type === "text_delta" && event.delta.text) {
        chunk.choices[0].delta = { content: event.delta.text };
        return chunk;
      }
      if (event.delta?.type === "input_json_delta" && event.delta.partial_json) {
        chunk.choices[0].delta = {
          tool_calls: [
            {
              index: event.index ?? 0,
              function: { arguments: event.delta.partial_json },
            },
          ],
        };
        return chunk;
      }
      return null;

    case "content_block_start":
      if (event.content_block?.type === "tool_use") {
        chunk.choices[0].delta = {
          tool_calls: [
            {
              index: event.index ?? 0,
              id: event.content_block.id,
              type: "function",
              function: { name: event.content_block.name, arguments: "" },
            },
          ],
        };
        return chunk;
      }
      return null;

    case "message_delta":
      if (event.delta?.type === "stop_reason") {
        chunk.choices[0].finish_reason = mapStopReason(
          (event.delta as any).stop_reason
        );
        return chunk;
      }
      return null;

    case "message_stop":
      chunk.choices[0].finish_reason = "stop";
      return chunk;

    default:
      return null;
  }
}
