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
      'deepseek-r1-distill-llama-70b',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'gemini-2.5-flash-preview-04-17',
    ],
  },

  /*
   * For users with a free account
   */
  regular: {
    maxMessagesPerDay: 50,
    availableChatModelIds: [
      'chat-model',
      'chat-model-reasoning',
      'deepseek-r1-distill-llama-70b',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'gemini-2.5-flash-preview-04-17',
    ],
  },

  /*
   * For users with a pro subscription
   */
//   pro: {
//     maxMessagesPerDay: 500,
//     availableChatModelIds: ['chat-model', 'chat-model-reasoning', 'llama-scout', 'qwen-qwq'],
//   },

//   /*
//    * For users with a premium subscription
//    */
//   premium: {
//     maxMessagesPerDay: 2000,
//     availableChatModelIds: ['chat-model', 'chat-model-reasoning', 'llama-scout', 'qwen-qwq', 'deepseek-r1'],
//   },
};
