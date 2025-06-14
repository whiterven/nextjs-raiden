//artifacts/slide/client.tsx
import { Artifact } from '@/components/create-artifact';
import {
  CopyIcon,
  DownloadIcon,
  RedoIcon,
  SparklesIcon,
  UndoIcon,
  PresentationIcon,
  FileIcon,
} from '@/components/icons';
import { SlideEditor } from '@/components/slide-editor';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

type Metadata = any;

export const slideArtifact = new Artifact<'slide', Metadata>({
  kind: 'slide',
  description: 'Useful for creating presentations and slide decks',
  initialize: async () => {},
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === 'slide-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
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
      <SlideEditor
        content={content}
        currentVersionIndex={currentVersionIndex}
        isCurrentVersion={isCurrentVersion}
        saveContent={onSaveContent}
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
        if (currentVersionIndex === 0) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <CopyIcon />,
      description: 'Copy as JSON',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied slide content to clipboard!');
      },
    },
    {
      icon: <DownloadIcon />,
      description: 'Export as PPTX',
      onClick: async ({ content }) => {
        try {
          const presentation = JSON.parse(content);
          const response = await fetch('/api/export-pptx', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(presentation),
          });
          if (!response.ok) throw new Error('Failed to export PPTX');
          const blob = await response.blob();
          saveAs(blob, `${presentation.title || 'presentation'}.pptx`);
          toast.success('PPTX exported successfully!');
        } catch (error) {
          toast.error('Failed to export PPTX');
        }
      },
    },
    {
      icon: <FileIcon />,
      description: 'Export as PDF',
      onClick: ({ content }) => {
        try {
          const presentation = JSON.parse(content);
          const pdf = new jsPDF();
          
          // Add title page
          pdf.setFontSize(24);
          pdf.text(presentation.title || 'Untitled Presentation', 105, 50, { align: 'center' });
          
          // Add content slides
          presentation.slides?.forEach((slide: any, index: number) => {
            if (index > 0 || presentation.slides.length > 0) {
              pdf.addPage();
            }
            
            // Add slide title
            pdf.setFontSize(20);
            pdf.text(slide.title || 'Untitled Slide', 20, 30);
            
            // Add bullet points
            if (slide.content && Array.isArray(slide.content)) {
              pdf.setFontSize(12);
              let yPosition = 50;
              slide.content.forEach((item: string) => {
                pdf.text(`• ${item}`, 25, yPosition);
                yPosition += 10;
              });
            }
          });
          
          pdf.save(`${presentation.title || 'presentation'}.pdf`);
          toast.success('PDF exported successfully!');
        } catch (error) {
          toast.error('Failed to export PDF');
        }
      },
    },
  ],
  toolbar: [
    {
      description: 'Enhance presentation',
      icon: <SparklesIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Can you please enhance this presentation with better content and structure?',
        });
      },
    },
    {
      description: 'Present mode',
      icon: <PresentationIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Can you provide speaker notes and presentation tips for this slide deck?',
        });
      },
    },
  ],
});