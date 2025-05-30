//lib/ai/entitlements.ts
import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account (Guest)
   */
  guest: {
    maxMessagesPerDay: 5,
    availableChatModelIds: [
      'chat-model',
      'groq-deepseek-r1',
      'chat-model-reasoning',
    ],
  },

  /*
   * For users with a free account (Regular)
   */
  regular: {
    maxMessagesPerDay: 5,
    availableChatModelIds: [
      // Basic Models
      'chat-model',
      'groq-deepseek-r1',
      'chat-model-reasoning',
    ],
  },

  /*
   * For users with Advanced plan ($19/month)
   */
  advanced: {
    maxMessagesPerDay: 100,
    availableChatModelIds: [
      // Basic Models
      'chat-model',
      'groq-deepseek-r1',
      'chat-model-reasoning',
      // Advanced Models
      'groq-llama-scout',
      'groq-qwen-qwq',
      'gemini-2-0-flash',
      'claude-3-5-sonnet',
      'claude-3-7-sonnet',
      'openai-o1',
      'openai-o3',
    ],
  },

  /*
   * For users with Expert plan ($41/month)
   */
  expert: {
    maxMessagesPerDay: -1, // Unlimited
    availableChatModelIds: [
      // All Models
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
    ],
  },
};