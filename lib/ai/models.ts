
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
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    description: 'Groq: Fast, efficient Llama 3.1 8B model.',
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 Distill Llama 70B',
    description: 'Groq: Distilled Llama 70B model by DeepSeek.',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Google: Fast, multimodal model.',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Google: Efficient, multimodal model with a large context window.',
  },
  {
    id: 'gemini-2.5-pro-preview-05-06',
    name: 'Gemini 2.5 Pro Preview 05-06',
    description: 'Google: Powerful multimodal model (Preview).',
  },
  {
    id: 'gemini-2.5-flash-preview-04-17',
    name: 'Gemini 2.5 Flash Preview 04-17',
    description: 'Google: Fast multimodal model (Preview).',
  },
  {
    id: 'gemini-2.5-pro-exp-03-25',
    name: 'Gemini 2.5 Pro Exp 03-25',
    description: 'Google: Experimental multimodal model.',
  },
  {
    id: 'gemini-2.0-flash-preview-image-generation',
    name: 'Gemini 2.0 Flash Preview Image Generation',
    description: 'Google: Image generation model (Preview).',
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    description: 'Anthropic: Fast and affordable model.',
  },
  {
    id: 'claude-4-opus-20250514',
    name: 'Claude 4 Opus',
    description: 'Anthropic: Most powerful model.',
  },
  {
    id: 'claude-4-sonnet-20250514',
    name: 'Claude 4 Sonnet',
    description: 'Anthropic: Balanced model for general tasks.',
  },
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet',
    description: 'Anthropic: Latest Sonnet model.',
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic: Multimodal model with file support.',
  },
];
