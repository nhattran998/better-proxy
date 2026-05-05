import { z } from 'zod';

const TextContentPart = z.object({
  type: z.literal('text'),
  text: z.string(),
});

const ImageContentPart = z.object({
  type: z.literal('image_url'),
  image_url: z.object({
    url: z.string().url(),
    detail: z.enum(['auto', 'low', 'high']).optional(),
  }),
});

export const ContentPartSchema = z.union([TextContentPart, ImageContentPart]);

export const MessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.union([z.string(), z.array(ContentPartSchema)]),
  name: z.string().optional(),
  tool_calls: z.array(z.any()).optional(),
  tool_call_id: z.string().optional(),
});

export const ToolSchema = z.object({
  type: z.literal('function'),
  function: z.object({
    name: z.string(),
    description: z.string().optional(),
    parameters: z.record(z.string(), z.any()).optional(),
  }),
});

export const ChatRequestSchema = z.object({
  model: z.string(),
  messages: z.array(MessageSchema).min(1),
  stream: z.boolean().default(false),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().positive().optional(),
  top_p: z.number().min(0).max(1).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  tools: z.array(ToolSchema).optional(),
  tool_choice: z.union([z.string(), z.object({})]).optional(),
});

export const ChatChoiceSchema = z.object({
  index: z.number(),
  message: MessageSchema,
  finish_reason: z.enum(['stop', 'length', 'tool_calls', 'content_filter']).nullable(),
});

export const UsageSchema = z.object({
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  total_tokens: z.number(),
});

export const ChatResponseSchema = z.object({
  id: z.string(),
  object: z.literal('chat.completion'),
  created: z.number(),
  model: z.string(),
  choices: z.array(ChatChoiceSchema),
  usage: UsageSchema.optional(),
});

export type Message = z.infer<typeof MessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type Usage = z.infer<typeof UsageSchema>;
