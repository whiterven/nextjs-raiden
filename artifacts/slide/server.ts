//artifacts/slide/server.ts
import { myProvider } from '@/lib/ai/providers';
import { slidePrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from 'ai';
import { z } from 'zod';
import { getSelectedModel } from '@/lib/ai/selectedModel';

const slideSchema = z.object({
  title: z.string().describe('Slide title'),
  content: z.array(z.string()).describe('Bullet points for the slide'),
});

const presentationSchema = z.object({
  title: z.string().describe('Presentation title'),
  slides: z.array(slideSchema).describe('Array of slides'),
});

export const slideDocumentHandler = createDocumentHandler<'slide'>({
  kind: 'slide',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel(getSelectedModel()),
      system: slidePrompt,
      prompt: title,
      schema: presentationSchema,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const presentation = object;

        if (presentation && (presentation.title || presentation.slides)) {
          const jsonContent = JSON.stringify(presentation, null, 2);
          
          dataStream.writeData({
            type: 'slide-delta',
            content: jsonContent,
          });

          draftContent = jsonContent;
        }
      }
    }

    dataStream.writeData({
      type: 'slide-delta',
      content: draftContent,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel(getSelectedModel()),
      system: updateDocumentPrompt(document.content, 'slide'),
      prompt: description,
      schema: presentationSchema,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const presentation = object;

        if (presentation && (presentation.title || presentation.slides)) {
          const jsonContent = JSON.stringify(presentation, null, 2);
          
          dataStream.writeData({
            type: 'slide-delta',
            content: jsonContent,
          });

          draftContent = jsonContent;
        }
      }
    }

    return draftContent;
  },
});