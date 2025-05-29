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
    id: 'llama-scout',
    name: 'Llama Scout',
    description: 'Fast and efficient general-purpose model',
  },
  {
    id: 'qwen-qwq',
    name: 'Qwen QWQ',
    description: 'Advanced reasoning capabilities with 32B parameters',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    description: 'Distilled reasoning model with high efficiency',
  },
];
