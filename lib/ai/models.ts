//lib/ai/models.ts
export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Chat model',
    description: 'Primary model for all-purpose chat',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning',
  },
  {
    id: 'groq-llama-scout',
    name: 'Llama 4 Scout',
    description: 'Meta\'s latest Llama model for general chat',
  },
  {
    id: 'groq-deepseek-r1',
    name: 'DeepSeek R1 Distill',
    description: 'Advanced reasoning model with thinking ability',
  },
  {
    id: 'groq-qwen-qwq',
    name: 'Qwen QwQ',
    description: 'Reasoning model with enhanced thinking capabilities',
  },
];