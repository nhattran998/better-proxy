import type {
  OpenAIRequest,
  OpenAIMessage,
  ClaudeRequest,
  ClaudeMessage,
  ClaudeContentBlock,
  ClaudeTool,
  ContentPart,
} from "./types";

export function openaiToClaudeRequest(openai: OpenAIRequest): ClaudeRequest {
  let system: string | undefined;
  const messages: ClaudeMessage[] = [];

  for (const msg of openai.messages) {
    if (msg.role === "system") {
      system = system
        ? `${system}\n\n${extractTextContent(msg.content)}`
        : extractTextContent(msg.content);
      continue;
    }

    const converted = convertMessage(msg);
    if (converted) {
      messages.push(converted);
    }
  }

  // Merge consecutive same-role messages
  const merged = mergeConsecutiveMessages(messages);

  const request: ClaudeRequest = {
    model: mapModel(openai.model),
    messages: merged,
    max_tokens: openai.max_tokens ?? 4096,
    stream: openai.stream,
  };

  if (system) request.system = system;
  if (openai.temperature !== undefined) request.temperature = openai.temperature;
  if (openai.top_p !== undefined) request.top_p = openai.top_p;

  if (openai.tools?.length) {
    request.tools = openai.tools.map(convertTool);
  }

  if (openai.tool_choice) {
    request.tool_choice = convertToolChoice(openai.tool_choice);
  }

  return request;
}

function convertMessage(msg: OpenAIMessage): ClaudeMessage | null {
  const role = msg.role === "assistant" ? "assistant" : "user";

  if (msg.role === "tool") {
    return {
      role: "user",
      content: [
        {
          type: "tool_result",
          tool_use_id: msg.tool_call_id,
          content: extractTextContent(msg.content),
        },
      ],
    };
  }

  if (msg.tool_calls?.length) {
    const blocks: ClaudeContentBlock[] = msg.tool_calls.map((tc) => ({
      type: "tool_use" as const,
      id: tc.id,
      name: tc.function.name,
      input: JSON.parse(tc.function.arguments || "{}"),
    }));

    const text = extractTextContent(msg.content);
    if (text) {
      blocks.unshift({ type: "text", text });
    }

    return { role: "assistant", content: blocks };
  }

  const content = convertContent(msg.content);
  if (!content) return null;

  return { role, content };
}

function convertContent(
  content: string | ContentPart[]
): string | ClaudeContentBlock[] {
  if (typeof content === "string") return content;

  const blocks: ClaudeContentBlock[] = [];
  for (const part of content) {
    if (part.type === "text" && part.text) {
      blocks.push({ type: "text", text: part.text });
    } else if (part.type === "image_url" && part.image_url?.url) {
      const url = part.image_url.url;
      if (url.startsWith("data:")) {
        const match = url.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          blocks.push({
            type: "image",
            source: {
              type: "base64",
              media_type: match[1],
              data: match[2],
            },
          });
        }
      }
    }
  }
  return blocks.length === 1 && blocks[0].type === "text"
    ? blocks[0].text!
    : blocks;
}

function convertTool(tool: { type: string; function: any }): ClaudeTool {
  return {
    name: tool.function.name,
    description: tool.function.description,
    input_schema: tool.function.parameters || { type: "object", properties: {} },
  };
}

function convertToolChoice(
  choice: string | { type: string; function?: { name: string } }
): { type: string; name?: string } {
  if (typeof choice === "string") {
    if (choice === "auto") return { type: "auto" };
    if (choice === "none") return { type: "none" };
    if (choice === "required") return { type: "any" };
    return { type: "auto" };
  }
  if (choice.type === "function" && choice.function?.name) {
    return { type: "tool", name: choice.function.name };
  }
  return { type: "auto" };
}

function extractTextContent(content: string | ContentPart[]): string {
  if (typeof content === "string") return content;
  return content
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text!)
    .join("\n");
}

function mergeConsecutiveMessages(messages: ClaudeMessage[]): ClaudeMessage[] {
  const result: ClaudeMessage[] = [];

  for (const msg of messages) {
    const last = result[result.length - 1];
    if (last && last.role === msg.role) {
      last.content = mergeContent(last.content, msg.content);
    } else {
      result.push({ ...msg });
    }
  }

  return result;
}

function mergeContent(
  a: string | ClaudeContentBlock[],
  b: string | ClaudeContentBlock[]
): string | ClaudeContentBlock[] {
  const aBlocks = typeof a === "string" ? [{ type: "text" as const, text: a }] : a;
  const bBlocks = typeof b === "string" ? [{ type: "text" as const, text: b }] : b;
  return [...aBlocks, ...bBlocks];
}

function mapModel(model: string): string {
  const mappings: Record<string, string> = {
    "gpt-4": "claude-sonnet-4-20250514",
    "gpt-4-turbo": "claude-sonnet-4-20250514",
    "gpt-4o": "claude-sonnet-4-20250514",
    "gpt-3.5-turbo": "claude-haiku-4-20250514",
  };
  return mappings[model] || model;
}
