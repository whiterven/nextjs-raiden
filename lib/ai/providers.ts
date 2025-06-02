//lib/ai/providers.ts
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// Function to create provider with dynamic artifact model
export const createProviderWithArtifactModel = (selectedModel?: string) => {
  if (isTestEnvironment) {
    return customProvider({
      languageModels: {
        'grok-2-vision': chatModel,
        'grok-3-mini-beta': reasoningModel,
        'title-model': titleModel,
        'artifact-model': selectedModel ? 
          (['grok-3-mini-beta', 'groq-deepseek-r1', 'groq-qwen-qwq', 'gemini-2-5-pro-preview', 'gemini-2-5-flash-preview', 'gemini-2-5-pro-exp', 'claude-4-opus', 'claude-4-sonnet', 'claude-3-7-sonnet', 'openai-o4-mini', 'openai-o3', 'openai-o3-mini', 'openai-o1', 'openai-o1-mini', 'openai-o1-preview'].includes(selectedModel) ? reasoningModel : chatModel) 
          : artifactModel,
        'groq-llama-scout': chatModel,
        'groq-deepseek-r1': reasoningModel,
        'groq-qwen-qwq': reasoningModel,
        'gemini-2-5-pro-preview': reasoningModel,
        'gemini-2-5-flash-preview': reasoningModel,
        'gemini-2-5-pro-exp': reasoningModel,
        'gemini-2-0-flash': chatModel,
        'claude-4-opus': reasoningModel,
        'claude-4-sonnet': reasoningModel,
        'claude-3-7-sonnet': reasoningModel,
        'claude-3-5-sonnet': chatModel,
        'openai-o4-mini': reasoningModel,
        'openai-o3': reasoningModel,
        'openai-o3-mini': reasoningModel,
        'openai-o1': reasoningModel,
        'openai-o1-mini': reasoningModel,
        'openai-o1-preview': reasoningModel,
      },
    });
  }

  // Define all available models
  const modelDefinitions = {
    // XAI Models
    'grok-2-vision': xai('grok-2-vision-1212'),
    'grok-3-mini-beta': wrapLanguageModel({
      model: xai('grok-3-mini-beta'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'grok-2-1212': xai('grok-2-1212'),
    
    // Groq Models
    'groq-llama-scout': groq('meta-llama/llama-4-scout-17b-16e-instruct'),
    'groq-deepseek-r1': wrapLanguageModel({
      model: groq('deepseek-r1-distill-llama-70b'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'groq-qwen-qwq': wrapLanguageModel({
      model: groq('qwen-qwq-32b'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    
    // Google Gemini Models
    'gemini-2-5-pro-preview': wrapLanguageModel({
      model: google('gemini-2.5-pro-preview-05-06'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'gemini-2-5-flash-preview': wrapLanguageModel({
      model: google('gemini-2.5-flash-preview-04-17'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'gemini-2-5-pro-exp': wrapLanguageModel({
      model: google('gemini-2.5-pro-exp-03-25'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'gemini-2-0-flash': google('gemini-2.0-flash'),
    
    // Anthropic Claude Models
    'claude-4-opus': wrapLanguageModel({
      model: anthropic('claude-4-opus-20250514'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'claude-4-sonnet': wrapLanguageModel({
      model: anthropic('claude-4-sonnet-20250514'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'claude-3-7-sonnet': wrapLanguageModel({
      model: anthropic('claude-3-7-sonnet-20250219'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'claude-3-5-sonnet': anthropic('claude-3-5-sonnet-20240620'),
    
    // OpenAI Models
    'openai-o4-mini': wrapLanguageModel({
      model: openai('o4-mini'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'openai-o3': wrapLanguageModel({
      model: openai('o3'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'openai-o3-mini': wrapLanguageModel({
      model: openai('o3-mini'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'openai-o1': wrapLanguageModel({
      model: openai('o1'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'openai-o1-mini': wrapLanguageModel({
      model: openai('o1-mini'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'openai-o1-preview': wrapLanguageModel({
      model: openai('o1-preview'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
  };

  // Set artifact-model to the selected model, or default to grok-2-1212
  const artifactModelKey = selectedModel && modelDefinitions[selectedModel as keyof typeof modelDefinitions] 
    ? selectedModel 
    : 'grok-2-1212';

  return customProvider({
    languageModels: {
      ...modelDefinitions,
      'artifact-model': modelDefinitions[artifactModelKey as keyof typeof modelDefinitions],
    },
    imageModels: {
      'small-model': xai.image('grok-2-image'),
    },
  });
};

// Default provider (for backward compatibility)
export const myProvider = createProviderWithArtifactModel();

// Export function to update provider with selected model
export const getProviderWithSelectedModel = (selectedModel: string) => {
  return createProviderWithArtifactModel(selectedModel);
};