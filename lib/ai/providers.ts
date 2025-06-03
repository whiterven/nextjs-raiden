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
import { mistral } from '@ai-sdk/mistral';
import { perplexity } from '@ai-sdk/perplexity';
import { togetherai } from '@ai-sdk/togetherai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'grok-2-vision': chatModel,
        'grok-3': chatModel,
        'grok-3-fast': chatModel,
        'grok-3-mini': chatModel,
        'grok-3-mini-fast': chatModel,
        'grok-3-mini-beta': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
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
        'pixtral-large-latest': chatModel,
        'mistral-large-latest': chatModel,
        'mistral-small-latest': chatModel,
        'sonar-pro': chatModel,
        'sonar': chatModel,
        'sonar-deep-research': chatModel,
        'mixtral-8x22b-instruct': chatModel,
        'mistral-7b-instruct': chatModel,
        'deepseek-v3': reasoningModel,
      },
    })
  : customProvider({
      languageModels: {
        // XAI Models
        'grok-2-vision': xai('grok-2-vision-1212'),
        'grok-3': xai('grok-3'),
        'grok-3-fast': xai('grok-3-fast'),
        'grok-3-mini': xai('grok-3-mini'),
        'grok-3-mini-fast': xai('grok-3-mini-fast'),
        'grok-3-mini-beta': wrapLanguageModel({
          model: xai('grok-3-mini-beta'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': xai('grok-2-1212'),
        'artifact-model': xai('grok-2-1212'),
        
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
        
        // Mistral Models (No Reasoning)
        'pixtral-large-latest': mistral('pixtral-large-latest'),
        'mistral-large-latest': mistral('mistral-large-latest'),
        'mistral-small-latest': mistral('mistral-small-latest'),
        
        // Perplexity Models (No Reasoning)
        'sonar-pro': perplexity('sonar-pro'),
        'sonar': perplexity('sonar'),
        'sonar-deep-research': perplexity('sonar-deep-research'),
        
        // Together.ai Models
        'mixtral-8x22b-instruct': togetherai('mistralai/Mixtral-8x22B-Instruct-v0.1'),
        'mistral-7b-instruct': togetherai('mistralai/Mistral-7B-Instruct-v0.3'),
        'deepseek-v3': wrapLanguageModel({
          model: togetherai('deepseek-ai/DeepSeek-V3'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
      },
      imageModels: {
        'small-model': xai.image('grok-2-image'),
        // Together.ai Image Models
        'stable-diffusion-xl': togetherai.image('stabilityai/stable-diffusion-xl-base-1.0'),
        'flux-dev': togetherai.image('black-forest-labs/FLUX.1-dev'),
        'flux-dev-lora': togetherai.image('black-forest-labs/FLUX.1-dev-lora'),
        'flux-schnell': togetherai.image('black-forest-labs/FLUX.1-schnell'),
        'flux-canny': togetherai.image('black-forest-labs/FLUX.1-canny'),
        'flux-depth': togetherai.image('black-forest-labs/FLUX.1-depth'),
        'flux-redux': togetherai.image('black-forest-labs/FLUX.1-redux'),
        'flux-pro-1-1': togetherai.image('black-forest-labs/FLUX.1.1-pro'),
        'flux-pro': togetherai.image('black-forest-labs/FLUX.1-pro'),
        'flux-schnell-free': togetherai.image('black-forest-labs/FLUX.1-schnell-Free'),
      },
    });