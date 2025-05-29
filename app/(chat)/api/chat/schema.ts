//app/(chat)/api/chat/schema.ts
import { z } from 'zod';

const textPartSchema = z.object({
  text: z.string().min(1).max(2000),
  type: z.enum(['text']),
});

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    createdAt: z.coerce.date(),
    role: z.enum(['user']),
    content: z.string().min(1).max(2000),
    parts: z.array(textPartSchema),
    experimental_attachments: z
      .array(
        z.object({
          url: z.string().url(),
          name: z.string().min(1).max(2000),
          contentType: z.enum(['image/png', 'image/jpg', 'image/jpeg']),
        }),
      )
      .optional(),
  }),
  selectedChatModel: z.enum([
    // XAI Models
    'chat-model', 
    'chat-model-reasoning',
    // Groq Models
    'groq-llama-scout',
    'groq-deepseek-r1',
    'groq-qwen-qwq',
    // Google Gemini Models
    'gemini-2-5-pro-preview',
    'gemini-2-5-flash-preview',
    'gemini-2-5-pro-exp',
    'gemini-2-0-flash',
    // Anthropic Claude Models
    'claude-4-opus',
    'claude-4-sonnet',
    'claude-3-7-sonnet',
    'claude-3-5-sonnet',
    // OpenAI Models
    'openai-o4-mini',
    'openai-o3',
    'openai-o3-mini',
    'openai-o1',
    'openai-o1-mini',
    'openai-o1-preview',
  ]),
  selectedVisibilityType: z.enum(['public', 'private']),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;