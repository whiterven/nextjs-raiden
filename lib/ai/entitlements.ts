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
    maxMessagesPerDay: 1,
    availableChatModelIds: [
      'groq-deepseek-r1',
      'groq-llama-scout',
      'gemini-2-0-flash',
      'mistral-small-latest',
      // 'sonar',
    ],
    // canUseTools: false,
    // canCreateDocuments: true,
    // canUseAdvancedFeatures: false,
  },

  /*
   * For users with a free account (Regular)
   */
  regular: {
    maxMessagesPerDay: 20,
    availableChatModelIds: [
      // Basic Models
      'groq-deepseek-r1',
      // 'grok-2-vision',
      // 'grok-3-mini',
      'groq-llama-scout',
      'groq-qwen-qwq',
      'gemini-2-0-flash',
      'mistral-small-latest',
      'mistral-7b-instruct',
      'sonar',
    ],
  },

  /*
   * For users with Advanced plan ($19/month)
   */
  advanced: {
    maxMessagesPerDay: 100,
    availableChatModelIds: [
      // Basic Models
      // 'grok-2-vision',
      // 'grok-3',
      // 'grok-3-fast',
      // 'grok-3-mini',
      // 'grok-3-mini-fast',
      // 'grok-3-mini-beta',
      'groq-deepseek-r1',
      // Advanced Models
      'groq-llama-scout',
      'groq-qwen-qwq',
      'gemini-2-0-flash',
      'claude-3-5-sonnet',
      'claude-3-7-sonnet',
      'openai-o1',
      'openai-o3',
      'mistral-large-latest',
      'mistral-small-latest',
      'pixtral-large-latest',
      'sonar',
      'sonar-pro',
      'mixtral-8x22b-instruct',
      'mistral-7b-instruct',
    ],
  },

  /*
   * For users with Expert plan ($41/month)
   */
  expert: {
    maxMessagesPerDay: -1, // Unlimited
    availableChatModelIds: [
      // Grok Models
      // 'grok-2-vision',
      // 'grok-3',
      // 'grok-3-fast',
      // 'grok-3-mini',
      // 'grok-3-mini-fast',
      // 'grok-3-mini-beta',
      // // Groq Models
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
      // Mistral Models
      'pixtral-large-latest',
      'mistral-large-latest',
      'mistral-small-latest',
      // Perplexity Models
      'sonar-pro',
      'sonar',
      'sonar-deep-research',
      // Together.ai Models
      'mixtral-8x22b-instruct',
      'mistral-7b-instruct',
      'deepseek-v3',
    ],
  },
};