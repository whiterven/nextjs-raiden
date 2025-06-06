//artifacts/chart/client.tsx
import { Artifact } from '@/components/create-artifact';
import {
  CopyIcon,
  DownloadIcon,
  RedoIcon,
  UndoIcon,
  BarChartIcon,
  LineChartIcon,
  PieChartIcon,
  SparklesIcon,
  SettingsIcon,
} from '@/components/icons';
import { ChartVisualization } from '@/components/chart-visualization';
import { toast } from 'sonner';

type ChartMetadata = {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'doughnut';
  title: string;
  data: Array<Record<string, string | number>>;
  xAxis?: string;
  yAxis?: string;
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gradient' | 'rainbow';
  showLegend?: boolean;
  showGrid?: boolean;
  animation?: boolean;
};

export const chartArtifact = new Artifact<'chart', ChartMetadata>({
  kind: 'chart',
  description: 'Interactive data visualization with multiple chart types',
  initialize: async () => {},
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === 'chart-delta') {
      try {
        // Check if content is a non-empty string before parsing
        const content = streamPart.content as string;
        if (!content || typeof content !== 'string' || content.trim() === '') {
          console.warn('Received empty chart content, skipping update');
          return;
        }
        
        const chartConfig = JSON.parse(content);
        
        // Validate that we have the minimal required chart data
        if (!chartConfig || !chartConfig.type || !chartConfig.data) {
          console.warn('Received invalid chart config, missing required fields', chartConfig);
          return;
        }
        
        setArtifact((draftArtifact) => ({
          ...draftArtifact,
          content: content,
          isVisible: true,
          status: 'streaming',
        }));
      } catch (error) {
        console.error('Failed to parse chart config:', error, 'Content:', streamPart.content);
        
        // Don't break the UI, set artifact with error state if possible
        setArtifact((draftArtifact) => ({
          ...draftArtifact,
          isVisible: true,
          status: 'idle',
        }));
      }
    }
  },
  content: ({
    content,
    currentVersionIndex,
    isCurrentVersion,
    onSaveContent,
    status,
  }) => {
    return (
      <ChartVisualization
        content={content}
        currentVersionIndex={currentVersionIndex}
        isCurrentVersion={isCurrentVersion}
        saveContent={(updatedContent, debounce = true) => onSaveContent(updatedContent, debounce)}
        status={status}
      />
    );
  },
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        return currentVersionIndex === 0;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        return isCurrentVersion;
      },
    },
    {
      icon: <CopyIcon />,
      description: 'Copy chart configuration',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Chart configuration copied to clipboard!');
      },
    },
    {
      icon: <DownloadIcon />,
      description: 'Download as PNG',
      onClick: ({ content }) => {
        // This would trigger the download functionality in the ChartVisualization component
        const event = new CustomEvent('downloadChart', { detail: { format: 'png' } });
        window.dispatchEvent(event);
        toast.success('Chart downloaded successfully!');
      },
    },
  ],
  toolbar: [
    {
      description: 'Change to Bar Chart',
      icon: <BarChartIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Change this to a bar chart with better colors',
        });
      },
    },
    {
      description: 'Change to Line Chart',
      icon: <LineChartIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Convert this to a line chart with smooth curves',
        });
      },
    },
    {
      description: 'Change to Pie Chart',
      icon: <PieChartIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Transform this into a pie chart with percentage labels',
        });
      },
    },
    {
      description: 'Enhance visualization',
      icon: <SparklesIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Make this chart more visually appealing with better colors, animations, and styling',
        });
      },
    },
    {
      description: 'Customize settings',
      icon: <SettingsIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Add more customization options like grid lines, legends, and axis labels',
        });
      },
    },
  ],
});