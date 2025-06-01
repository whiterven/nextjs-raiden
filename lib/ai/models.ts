//lib/ai/models.ts
export const DEFAULT_CHAT_MODEL: string = 'gemini-2-0-flash';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  // XAI Models
  {
    id: 'grok-2-vision',
    name: 'Grok 2 Vision',
    description: 'Primary model for all-purpose chat',
  },
  {
    id: 'grok-3',
    name: 'Grok 3',
    description: 'Latest xAI model for advanced conversations',
  },
  {
    id: 'grok-3-fast',
    name: 'Grok 3 Fast',
    description: 'Fast version of Grok 3 for quick responses',
  },
  {
    id: 'grok-3-mini',
    name: 'Grok 3 Mini',
    description: 'Compact version of Grok 3',
  },
  {
    id: 'grok-3-mini-fast',
    name: 'Grok 3 Mini Fast',
    description: 'Fast and compact Grok 3 model',
  },
  {
    id: 'grok-3-mini-beta',
    name: 'Grok 3 Mini beta',
    description: 'xAI Powerful Model with reasoning',
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
  
  // Mistral Models
  {
    id: 'pixtral-large-latest',
    name: 'Pixtral Large',
    description: 'Mistral\'s multimodal model for text and vision',
  },
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large',
    description: 'Mistral\'s most capable large language model',
  },
  {
    id: 'mistral-small-latest',
    name: 'Mistral Small',
    description: 'Efficient Mistral model for everyday tasks',
  },
  
  // Perplexity Models
  {
    id: 'sonar-pro',
    name: 'Sonar Pro',
    description: 'Perplexity\'s premium search-enhanced model',
  },
  {
    id: 'sonar',
    name: 'Sonar',
    description: 'Perplexity\'s search-powered language model',
  },
  {
    id: 'sonar-deep-research',
    name: 'Sonar Deep Research',
    description: 'Advanced research model with deep analysis capabilities',
  },
  
  // Together.ai Models
  {
    id: 'mixtral-8x22b-instruct',
    name: 'Mixtral 8x22B Instruct',
    description: 'Mistral\'s mixture of experts model via Together.ai',
  },
  {
    id: 'mistral-7b-instruct',
    name: 'Mistral 7B Instruct',
    description: 'Efficient 7B parameter Mistral model',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    description: 'Advanced reasoning model with thinking capabilities',
  },
];