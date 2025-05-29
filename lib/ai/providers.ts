import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  type LanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { openai } from '@ai-sdk/openai';

// Enhance model with reasoning and artifact capabilities
const enhanceModel = (
  model: LanguageModel, 
  options: { 
    reasoning?: boolean;
    artifacts?: boolean;
  } = {}
) => {
  let enhancedModel = model;
  
  // Add reasoning capabilities for supported models
  if (options.reasoning) {
    enhancedModel = wrapLanguageModel({
      model,
      middleware: extractReasoningMiddleware({ 
        tagName: 'think',
        separator: options.artifacts ? '\n\nThinking about artifact generation:\n' : undefined
      }),
    });
  }

  return enhancedModel;
};

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'deepseek-r1-distill-llama-70b': chatModel,
        'meta-llama/llama-4-scout-17b-16e-instruct': chatModel,
        'gemini-2.0-flash': chatModel,
        'gemini-2.5-pro-preview-05-06': chatModel,
        'gemini-2.5-flash-preview-04-17': chatModel,
        'gemini-2.5-pro-exp-03-25': chatModel,
        'claude-3-haiku-20240307': chatModel,
        'claude-4-opus-20250514': chatModel,
        'claude-4-sonnet-20250514': chatModel,
        'claude-3-7-sonnet-20250219': chatModel,
        'claude-3-5-sonnet-20241022': chatModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
        'gpt-4.1': openai('gpt-4.1'),
        'gpt-4.1-mini': openai('gpt-4.1-mini'),
        'gpt-4.1-nano': openai('gpt-4.1-nano'),
        'gpt-4o': openai('gpt-4o'),
        'gpt-4o-mini': openai('gpt-4o-mini'),
        'gpt-4o-audio-preview': openai('gpt-4o-audio-preview'),
        'gpt-4o-mini-web': openai.responses('gpt-4o-mini'),
      },
      imageModels: {
        'small-model': xai.image('grok-2-image'),
      },
    })
  : customProvider({
      languageModels: {
        // Primary xAI models with reasoning and artifact capabilities
        'chat-model': enhanceModel(xai('grok-2-vision-1212'), { artifacts: true }),
        'chat-model-reasoning': enhanceModel(xai('grok-3-mini-beta'), { 
          reasoning: true, 
          artifacts: true 
        }),

        // Groq models optimized for performance and reasoning
        'deepseek-r1-distill-llama-70b': enhanceModel(groq('deepseek-r1-distill-llama-70b')),
        'meta-llama/llama-4-scout-17b-16e-instruct': enhanceModel(
          groq('meta-llama/llama-4-scout-17b-16e-instruct'), 
          { reasoning: true, artifacts: true }
        ),

        // Google models with reasoning for pro versions
        'gemini-2.0-flash': enhanceModel(google('gemini-2.0-flash'), { artifacts: true }),
        'gemini-2.5-pro-preview-05-06': enhanceModel(google('gemini-2.5-pro-preview-05-06'), {
          reasoning: true,
          artifacts: true
        }),
        'gemini-2.5-flash-preview-04-17': enhanceModel(google('gemini-2.5-flash-preview-04-17'), {
          artifacts: true
        }),
        'gemini-2.5-pro-exp-03-25': enhanceModel(google('gemini-2.5-pro-exp-03-25'), {
          reasoning: true,
          artifacts: true
        }),

        // Anthropic models with enhanced capabilities for newer versions
        'claude-4-opus-20250514': enhanceModel(anthropic('claude-4-opus-20250514'), {
          reasoning: true,
          artifacts: true
        }),
        'claude-4-sonnet-20250514': enhanceModel(anthropic('claude-4-sonnet-20250514'), {
          reasoning: true,
          artifacts: true
        }),
        'claude-3-7-sonnet-20250219': enhanceModel(anthropic('claude-3-7-sonnet-20250219'), {
          reasoning: true,
          artifacts: true
        }),
        'claude-3-5-sonnet-20241022': enhanceModel(anthropic('claude-3-5-sonnet-20241022'), {
          artifacts: true
        }),

        // Specialized models
        'title-model': enhanceModel(xai('grok-2-1212')),
        'artifact-model': enhanceModel(xai('grok-2-1212'), { artifacts: true }),
        'gpt-4.1': openai('gpt-4.1'),
        'gpt-4.1-mini': openai('gpt-4.1-mini'),
        'gpt-4.1-nano': openai('gpt-4.1-nano'),
        'gpt-4o': openai('gpt-4o'),
        'gpt-4o-mini': openai('gpt-4o-mini'),
        'gpt-4o-audio-preview': openai('gpt-4o-audio-preview'),
        'gpt-4o-mini-web': openai.responses('gpt-4o-mini'),
      },
      imageModels: {
        'small-model': xai.image('grok-2-image'),
      },
    });