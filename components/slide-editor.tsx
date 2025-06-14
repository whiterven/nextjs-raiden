//components/slide-editor.tsx
'use client';

import React, { memo, useEffect, useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlusIcon, 
  TrashIcon,
  PenIcon,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type SlideEditorProps = {
  content: string;
  saveContent: (content: string, isCurrentVersion: boolean) => void;
  status: string;
  isCurrentVersion: boolean;
  currentVersionIndex: number;
};

interface Slide {
  title: string;
  content: string[];
}

interface Presentation {
  title: string;
  slides: Slide[];
}

const PureSlideEditor = ({
  content,
  saveContent,
  status,
  isCurrentVersion,
}: SlideEditorProps) => {
  const { theme } = useTheme();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const presentation = useMemo(() => {
    try {
      if (!content) {
        return {
          title: 'New Presentation',
          slides: [{ title: 'New Slide', content: ['Add your content here'] }]
        };
      }
      const parsed = JSON.parse(content) as Presentation;
      return {
        title: parsed.title || 'New Presentation',
        slides: parsed.slides || [{ title: 'New Slide', content: ['Add your content here'] }]
      };
    } catch {
      return {
        title: 'New Presentation',
        slides: [{ title: 'New Slide', content: ['Add your content here'] }]
      };
    }
  }, [content]);

  const [localPresentation, setLocalPresentation] = useState<Presentation>(presentation);

  useEffect(() => {
    setLocalPresentation(presentation);
  }, [presentation]);

  const updatePresentation = (newPresentation: Presentation) => {
    setLocalPresentation(newPresentation);
    const jsonContent = JSON.stringify(newPresentation, null, 2);
    saveContent(jsonContent, true);
  };

  const updatePresentationTitle = (newTitle: string) => {
    const updated = { ...localPresentation, title: newTitle };
    updatePresentation(updated);
  };

  const updateSlideTitle = (slideIndex: number, newTitle: string) => {
    const updated = {
      ...localPresentation,
      slides: localPresentation.slides.map((slide, index) =>
        index === slideIndex ? { ...slide, title: newTitle } : slide
      )
    };
    updatePresentation(updated);
  };

  const updateSlideContent = (slideIndex: number, newContent: string[]) => {
    const updated = {
      ...localPresentation,
      slides: localPresentation.slides.map((slide, index) =>
        index === slideIndex ? { ...slide, content: newContent } : slide
      )
    };
    updatePresentation(updated);
  };

  const addSlide = () => {
    const updated = {
      ...localPresentation,
      slides: [
        ...localPresentation.slides,
        { title: 'New Slide', content: ['Add your content here'] }
      ]
    };
    updatePresentation(updated);
    setCurrentSlideIndex(localPresentation.slides.length);
  };

  const deleteSlide = (slideIndex: number) => {
    if (localPresentation.slides.length <= 1) return;
    
    const updated = {
      ...localPresentation,
      slides: localPresentation.slides.filter((_, index) => index !== slideIndex)
    };
    updatePresentation(updated);
    
    if (currentSlideIndex >= updated.slides.length) {
      setCurrentSlideIndex(updated.slides.length - 1);
    }
  };

  const addBulletPoint = (slideIndex: number) => {
    const slide = localPresentation.slides[slideIndex];
    const updated = [...slide.content, 'New point'];
    updateSlideContent(slideIndex, updated);
  };

  const updateBulletPoint = (slideIndex: number, bulletIndex: number, newText: string) => {
    const slide = localPresentation.slides[slideIndex];
    const updated = slide.content.map((item, index) =>
      index === bulletIndex ? newText : item
    );
    updateSlideContent(slideIndex, updated);
  };

  const deleteBulletPoint = (slideIndex: number, bulletIndex: number) => {
    const slide = localPresentation.slides[slideIndex];
    if (slide.content.length <= 1) return;
    
    const updated = slide.content.filter((_, index) => index !== bulletIndex);
    updateSlideContent(slideIndex, updated);
  };

  const currentSlide = localPresentation.slides[currentSlideIndex] || localPresentation.slides[0];

  return (
    <div className={cn(
      "h-full flex flex-col",
      theme === 'dark' ? 'bg-zinc-900 text-zinc-50' : 'bg-white text-zinc-900'
    )}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <Input
                value={localPresentation.title}
                onChange={(e) => updatePresentationTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                }}
                className="text-xl font-bold"
                autoFocus
              />
            ) : (
              <h1 
                className="text-xl font-bold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded"
                onClick={() => setIsEditingTitle(true)}
              >
                {localPresentation.title}
                <PenIcon size={16} />
              </h1>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addSlide}
            >
              <PlusIcon size={16} />
              Add Slide
            </Button>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {currentSlideIndex + 1} of {localPresentation.slides.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Slide Navigation */}
        <div className="w-64 border-r overflow-y-auto">
          <div className="p-2">
            {localPresentation.slides.map((slide, index) => (
              <Card
                key={index}
                className={cn(
                  "mb-2 cursor-pointer transition-colors",
                  currentSlideIndex === index
                    ? "ring-2 ring-blue-500"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                )}
                onClick={() => setCurrentSlideIndex(index)}
              >
                <CardHeader className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-xs text-zinc-500 mb-1">
                        Slide {index + 1}
                      </div>
                      <div className="text-sm font-medium truncate">
                        {slide.title}
                      </div>
                    </div>
                    {localPresentation.slides.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSlide(index);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <TrashIcon size={16} />
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Slide Editor */}
        <div className="flex-1 flex flex-col">
          {/* Slide Navigation Controls */}
          <div className="flex justify-between items-center p-4 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeftIcon size={16} />
              Previous
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSlideIndex(Math.min(localPresentation.slides.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === localPresentation.slides.length - 1}
            >
              Next
              <ChevronRightIcon size={16} />
            </Button>
          </div>

          {/* Slide Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <Card className="h-full max-w-4xl mx-auto">
              <CardContent className="p-8 h-full">
                {/* Slide Title */}
                <Input
                  value={currentSlide?.title || ''}
                  onChange={(e) => updateSlideTitle(currentSlideIndex, e.target.value)}
                  className="text-2xl font-bold mb-6 border-none shadow-none text-center"
                  placeholder="Slide Title"
                />

                {/* Slide Content */}
                <div className="space-y-4">
                  {currentSlide?.content?.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="flex items-start gap-3">
                      <span className="text-lg mt-1">•</span>
                      <Textarea
                        value={bullet}
                        onChange={(e) => updateBulletPoint(currentSlideIndex, bulletIndex, e.target.value)}
                        className="flex-1 border-none shadow-none resize-none text-lg leading-relaxed"
                        placeholder="Bullet point content..."
                        rows={2}
                      />
                      {currentSlide.content.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBulletPoint(currentSlideIndex, bulletIndex)}
                          className="mt-1"
                        >
                          <TrashIcon size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addBulletPoint(currentSlideIndex)}
                    className="mt-4"
                  >
                    <PlusIcon size={16} />
                    Add Bullet Point
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

function areEqual(prevProps: SlideEditorProps, nextProps: SlideEditorProps) {
  return (
    prevProps.currentVersionIndex === nextProps.currentVersionIndex &&
    prevProps.isCurrentVersion === nextProps.isCurrentVersion &&
    !(prevProps.status === 'streaming' && nextProps.status === 'streaming') &&
    prevProps.content === nextProps.content &&
    prevProps.saveContent === nextProps.saveContent
  );
}

export const SlideEditor = memo(PureSlideEditor, areEqual);