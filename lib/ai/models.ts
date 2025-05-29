//lib/ai/models.ts
export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  // XAI Models
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
  
  // Groq Models
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
  
  // Google Gemini Models
  {
    id: 'gemini-2-5-pro-preview',
    name: 'Gemini 2.5 Pro Preview',
    description: 'Google\'s advanced model with thinking capabilities',
  },
  {
    id: 'gemini-2-5-flash-preview',
    name: 'Gemini 2.5 Flash Preview',
    description: 'Fast Google model with thinking capabilities',
  },
  {
    id: 'gemini-2-5-pro-exp',
    name: 'Gemini 2.5 Pro Experimental',
    description: 'Experimental Google model with advanced reasoning',
  },
  {
    id: 'gemini-2-0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Google\'s fast multimodal model',
  },
  
  // Anthropic Claude Models
  {
    id: 'claude-4-opus',
    name: 'Claude 4 Opus',
    description: 'Anthropic\'s most capable model with thinking ability',
  },
  {
    id: 'claude-4-sonnet',
    name: 'Claude 4 Sonnet',
    description: 'Balanced Claude model with thinking capability',
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    description: 'Advanced Claude model with reasoning',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'High-performance Claude chat model',
  },
  
  // OpenAI Models
  {
    id: 'openai-o4-mini',
    name: 'GPT-o4 Mini',
    description: 'OpenAI\'s efficient reasoning model',
  },
  {
    id: 'openai-o3',
    name: 'GPT-o3',
    description: 'OpenAI\'s advanced reasoning model',
  },
  {
    id: 'openai-o3-mini',
    name: 'GPT-o3 Mini',
    description: 'Compact OpenAI reasoning model',
  },
  {
    id: 'openai-o1',
    name: 'GPT-o1',
    description: 'OpenAI\'s thinking model',
  },
  {
    id: 'openai-o1-mini',
    name: 'GPT-o1 Mini',
    description: 'Efficient OpenAI thinking model',
  },
  {
    id: 'openai-o1-preview',
    name: 'GPT-o1 Preview',
    description: 'Preview of OpenAI\'s reasoning capabilities',
  },
];