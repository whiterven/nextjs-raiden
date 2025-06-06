//artifacts/chart/server.ts
import { myProvider } from '@/lib/ai/providers';
import { chartPrompt, updateChartPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from 'ai';
import { z } from 'zod';
import { getSelectedModel } from '@/lib/ai/selectedModel';

const chartConfigSchema = z.object({
  type: z.enum(['bar', 'line', 'pie', 'scatter', 'area', 'doughnut']).describe('Chart type'),
  title: z.string().describe('Chart title'),
  data: z.array(z.record(z.union([z.string(), z.number()]))).describe('Chart data array'),
  xAxis: z.string().optional().describe('X-axis field name'),
  yAxis: z.string().optional().describe('Y-axis field name'),
  colorScheme: z.enum(['blue', 'green', 'purple', 'orange', 'red', 'gradient', 'rainbow']).optional().describe('Color scheme'),
  showLegend: z.boolean().optional().describe('Show legend'),
  showGrid: z.boolean().optional().describe('Show grid lines'),
  animation: z.boolean().optional().describe('Enable animations'),
});

// Helper function to check if string is likely CSV
const isLikelyCSV = (str: string): boolean => {
  return typeof str === 'string' && 
         (str.includes(',') || str.includes(';')) && 
         (str.includes('\n') || str.includes('\r')) &&
         !str.includes('{') && !str.includes('[');
};

// Helper function to validate JSON string
const isValidChartJSON = (str: string): boolean => {
  try {
    const parsed = JSON.parse(str);
    return parsed && 
           typeof parsed === 'object' && 
           parsed.type && 
           Array.isArray(parsed.data) && 
           parsed.data.length > 0;
  } catch (e) {
    return false;
  }
};

export const chartDocumentHandler = createDocumentHandler<'chart'>({
  kind: 'chart',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';
    let hasReceivedValidData = false;

    try {
      const { fullStream } = streamObject({
        model: myProvider.languageModel(getSelectedModel()),
        system: chartPrompt,
        prompt: title,
        schema: chartConfigSchema,
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === 'object') {
          const { object } = delta;
          
          if (object && typeof object === 'object') {
            try {
              // Validate the object has the minimum required properties
              if (!object.type || !object.data || !Array.isArray(object.data)) {
                continue; // Skip invalid updates
              }
              
              const chartConfig = JSON.stringify(object, null, 2);
              
              // Extra check to ensure we're not sending CSV-like data
              if (isLikelyCSV(chartConfig)) {
                console.error('Received CSV-like data instead of JSON');
                continue;
              }
              
              if (!isValidChartJSON(chartConfig)) {
                console.error('Generated invalid chart JSON');
                continue;
              }
              
              dataStream.writeData({
                type: 'chart-delta',
                content: chartConfig,
              });

              draftContent = chartConfig;
              hasReceivedValidData = true;
            } catch (err) {
              console.error('Error processing chart data:', err);
            }
          }
        }
      }

      // If we received valid data, send one final update
      if (hasReceivedValidData && draftContent) {
        dataStream.writeData({
          type: 'chart-delta',
          content: draftContent,
        });
      }
      
      // If we didn't receive any valid data, retry once with a more explicit prompt
      if (!hasReceivedValidData) {
        console.warn('No valid chart data received, retrying with explicit JSON request');
        
        const { fullStream } = streamObject({
          model: myProvider.languageModel(getSelectedModel()),
          system: `${chartPrompt}\n\nCRITICAL: You MUST return ONLY a valid JSON object, not CSV or other formats.`,
          prompt: `${title} (Return ONLY valid JSON in the format {"type": "bar", "title": "...", "data": [...], ...})`,
          schema: chartConfigSchema,
        });
        
        for await (const delta of fullStream) {
          if (delta.type === 'object' && delta.object) {
            try {
              const chartConfig = JSON.stringify(delta.object, null, 2);
              
              if (isValidChartJSON(chartConfig)) {
                dataStream.writeData({
                  type: 'chart-delta',
                  content: chartConfig,
                });
                
                draftContent = chartConfig;
                break; // Stop once we get valid data
              }
            } catch (err) {
              console.error('Error in retry attempt:', err);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating chart:', error);
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';
    let hasReceivedValidData = false;

    try {
      const { fullStream } = streamObject({
        model: myProvider.languageModel(getSelectedModel()),
        system: updateChartPrompt(document.content || '', description),
        prompt: description,
        schema: chartConfigSchema,
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === 'object') {
          const { object } = delta;
          
          if (object && typeof object === 'object') {
            try {
              // Validate the object has the minimum required properties
              if (!object.type || !object.data || !Array.isArray(object.data)) {
                continue; // Skip invalid updates
              }
              
              const chartConfig = JSON.stringify(object, null, 2);
              
              // Extra check to ensure we're not sending CSV-like data
              if (isLikelyCSV(chartConfig)) {
                console.error('Received CSV-like data instead of JSON');
                continue;
              }
              
              if (!isValidChartJSON(chartConfig)) {
                console.error('Generated invalid chart JSON');
                continue;
              }
              
              dataStream.writeData({
                type: 'chart-delta',
                content: chartConfig,
              });

              draftContent = chartConfig;
              hasReceivedValidData = true;
            } catch (err) {
              console.error('Error processing chart update data:', err);
            }
          }
        }
      }

      // If we didn't receive any valid updated data, try to use the existing document content
      if (!hasReceivedValidData) {
        if (document.content && isValidChartJSON(document.content)) {
          draftContent = document.content;
          dataStream.writeData({
            type: 'chart-delta',
            content: draftContent,
          });
        } else {
          // Retry with explicit JSON instructions
          console.warn('No valid chart data received during update, retrying');
          
          const { fullStream } = streamObject({
            model: myProvider.languageModel(getSelectedModel()),
            system: `${updateChartPrompt(document.content || '', description)}\n\nCRITICAL: You MUST return ONLY a valid JSON object, not CSV or other formats.`,
            prompt: `${description} (Return ONLY valid JSON in the format {"type": "bar", "title": "...", "data": [...], ...})`,
            schema: chartConfigSchema,
          });
          
          for await (const delta of fullStream) {
            if (delta.type === 'object' && delta.object) {
              try {
                const chartConfig = JSON.stringify(delta.object, null, 2);
                
                if (isValidChartJSON(chartConfig)) {
                  dataStream.writeData({
                    type: 'chart-delta',
                    content: chartConfig,
                  });
                  
                  draftContent = chartConfig;
                  break; // Stop once we get valid data
                }
              } catch (err) {
                console.error('Error in update retry attempt:', err);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating chart:', error);
      
      // Try to use existing content if it's valid
      if (document.content && isValidChartJSON(document.content)) {
        draftContent = document.content;
        dataStream.writeData({
          type: 'chart-delta',
          content: draftContent,
        });
      }
    }

    return draftContent;
  },
});