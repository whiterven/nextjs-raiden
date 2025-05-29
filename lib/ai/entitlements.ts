//lib/ai/entitlements.ts
import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: [
      'chat-model', 
      'chat-model-reasoning',
      'groq-llama-scout'
    ],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: [
      'chat-model', 
      'chat-model-reasoning',
      'groq-llama-scout',
      'groq-deepseek-r1',
      'groq-qwen-qwq'
    ],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};