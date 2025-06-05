//components/console.tsx
import { TerminalWindowIcon, LoaderIcon, CrossSmallIcon } from './icons';
import { Button } from './ui/button';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';
import { useArtifactSelector } from '@/hooks/use-artifact';

export interface ConsoleOutputContent {
  type: 'text' | 'image' | 'error' | 'warning' | 'info' | 'html';
  value: string;
  timestamp?: number;
}

export interface ConsoleOutput {
  id: string;
  status: 'in_progress' | 'loading_packages' | 'completed' | 'failed';
  contents: Array<ConsoleOutputContent>;
  language?: string; // Track which language generated this output
  executionTime?: number; // Track execution time
}

interface ConsoleProps {
  consoleOutputs: Array<ConsoleOutput>;
  setConsoleOutputs: Dispatch<SetStateAction<Array<ConsoleOutput>>>;
  currentLanguage?: string; // Current language being executed
}

// Language-specific styling and icons
const getLanguageConfig = (language?: string) => {
  switch (language?.toLowerCase()) {
    case 'python':
      return {
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-950/20',
        label: 'Python',
        icon: '🐍'
      };
    case 'javascript':
      return {
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
        label: 'JavaScript',
        icon: '⚡'
      };
    case 'html':
      return {
        color: 'text-orange-500',
        bgColor: 'bg-orange-50 dark:bg-orange-950/20',
        label: 'HTML',
        icon: '🌐'
      };
    case 'css':
      return {
        color: 'text-purple-500',
        bgColor: 'bg-purple-50 dark:bg-purple-950/20',
        label: 'CSS',
        icon: '🎨'
      };
    case 'java':
      return {
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        label: 'Java',
        icon: '☕'
      };
    case 'sql':
      return {
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        label: 'SQL',
        icon: '🗄️'
      };
    default:
      return {
        color: 'text-gray-500',
        bgColor: 'bg-gray-50 dark:bg-gray-950/20',
        label: language || 'Code',
        icon: '📝'
      };
  }
};

// Get appropriate status message based on language
const getStatusMessage = (status: string, language?: string) => {
  switch (status) {
    case 'in_progress':
      switch (language?.toLowerCase()) {
        case 'python':
          return 'Running Python code...';
        case 'javascript':
          return 'Executing JavaScript...';
        case 'html':
          return 'Rendering HTML...';
        case 'css':
          return 'Applying CSS styles...';
        case 'java':
          return 'Compiling and running Java...';
        case 'sql':
          return 'Executing SQL query...';
        default:
          return 'Initializing...';
      }
    case 'loading_packages':
      switch (language?.toLowerCase()) {
        case 'python':
          return 'Installing Python packages...';
        case 'javascript':
          return 'Loading JavaScript modules...';
        default:
          return 'Loading dependencies...';
      }
    default:
      return 'Processing...';
  }
};

// Format content based on type and language
const formatContent = (content: ConsoleOutputContent, language?: string) => {
  switch (content.type) {
    case 'error':
      return {
        className: 'text-red-400 dark:text-red-300',
        prefix: '❌ ERROR: '
      };
    case 'warning':
      return {
        className: 'text-yellow-400 dark:text-yellow-300',
        prefix: '⚠️ WARNING: '
      };
    case 'info':
      return {
        className: 'text-blue-400 dark:text-blue-300',
        prefix: 'ℹ️ INFO: '
      };
    case 'html':
      return {
        className: 'text-orange-400 dark:text-orange-300',
        prefix: '🌐 HTML: '
      };
    default:
      return {
        className: 'dark:text-zinc-50 text-zinc-900',
        prefix: ''
      };
  }
};

export function Console({ 
  consoleOutputs, 
  setConsoleOutputs, 
  currentLanguage 
}: ConsoleProps) {
  const [height, setHeight] = useState<number>(300);
  const [isResizing, setIsResizing] = useState(false);
  const [filter, setFilter] = useState<string>('all'); // Filter by language
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  const minHeight = 100;
  const maxHeight = 800;

  // Get unique languages from outputs
  const availableLanguages = Array.from(
    new Set(consoleOutputs.map(output => output.language).filter(Boolean))
  );

  // Filter outputs based on selected filter
  const filteredOutputs = filter === 'all' 
    ? consoleOutputs 
    : consoleOutputs.filter(output => output.language === filter);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= minHeight && newHeight <= maxHeight) {
          setHeight(newHeight);
        }
      }
    },
    [isResizing],
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleOutputs]);

  useEffect(() => {
    if (!isArtifactVisible) {
      setConsoleOutputs([]);
      setFilter('all');
    }
  }, [isArtifactVisible, setConsoleOutputs]);

  const clearConsole = () => {
    setConsoleOutputs([]);
    setFilter('all');
  };

  const clearLanguageOutputs = (language: string) => {
    setConsoleOutputs(prev => prev.filter(output => output.language !== language));
  };

  return consoleOutputs.length > 0 ? (
    <>
      <div
        className="h-2 w-full fixed cursor-ns-resize z-50"
        onMouseDown={startResizing}
        style={{ bottom: height - 4 }}
        role="slider"
        aria-valuenow={height}
        aria-valuemin={minHeight}
        aria-valuemax={maxHeight}
      />

      <div
        className={cn(
          'fixed flex flex-col bottom-0 dark:bg-zinc-900 bg-zinc-50 w-full border-t z-40 overflow-y-scroll overflow-x-hidden dark:border-zinc-700 border-zinc-200',
          {
            'select-none': isResizing,
          },
        )}
        style={{ height }}
      >
        {/* Header with language filter */}
        <div className="flex flex-row justify-between items-center w-full h-fit border-b dark:border-zinc-700 border-zinc-200 px-2 py-1 sticky top-0 z-50 bg-muted">
          <div className="text-sm pl-2 dark:text-zinc-50 text-zinc-800 flex flex-row gap-3 items-center">
            <div className="text-muted-foreground">
              <TerminalWindowIcon />
            </div>
            <div className="flex items-center gap-2">
              <span>Console</span>
              {currentLanguage && (
                <span className={cn('text-xs px-2 py-1 rounded', getLanguageConfig(currentLanguage).bgColor)}>
                  {getLanguageConfig(currentLanguage).icon} {getLanguageConfig(currentLanguage).label}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language filter dropdown */}
            {availableLanguages.length > 1 && (
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-xs px-2 py-1 rounded border dark:bg-zinc-800 dark:border-zinc-600 bg-white border-zinc-300"
              >
                <option value="all">All Languages</option>
                {availableLanguages.map(lang => {
                  const config = getLanguageConfig(lang);
                  return (
                    <option key={lang} value={lang}>
                      {config.icon} {config.label}
                    </option>
                  );
                })}
              </select>
            )}
            
            <Button
              variant="ghost"
              className="size-fit p-1 hover:dark:bg-zinc-700 hover:bg-zinc-200"
              size="icon"
              onClick={clearConsole}
              title="Clear console"
            >
              <CrossSmallIcon />
            </Button>
          </div>
        </div>

        {/* Console content */}
        <div>
          {filteredOutputs.map((consoleOutput, index) => {
            const languageConfig = getLanguageConfig(consoleOutput.language);
            
            return (
              <div
                key={consoleOutput.id}
                className={cn(
                  'px-4 py-2 flex flex-row text-sm border-b dark:border-zinc-700 border-zinc-200 font-mono',
                  languageConfig.bgColor
                )}
              >
                <div className="flex items-start gap-2 w-20 shrink-0">
                  <div
                    className={cn('text-xs', {
                      'text-muted-foreground': [
                        'in_progress',
                        'loading_packages',
                      ].includes(consoleOutput.status),
                      'text-emerald-500': consoleOutput.status === 'completed',
                      'text-red-400': consoleOutput.status === 'failed',
                    })}
                  >
                    [{index + 1}]
                  </div>
                  {consoleOutput.language && (
                    <span className={cn('text-xs', languageConfig.color)} title={languageConfig.label}>
                      {languageConfig.icon}
                    </span>
                  )}
                </div>
                
                {['in_progress', 'loading_packages'].includes(
                  consoleOutput.status,
                ) ? (
                  <div className="flex flex-row gap-2">
                    <div className="animate-spin size-fit self-center mb-auto mt-0.5">
                      <LoaderIcon />
                    </div>
                    <div className="text-muted-foreground">
                      {consoleOutput.status === 'in_progress'
                        ? getStatusMessage('in_progress', consoleOutput.language)
                        : consoleOutput.status === 'loading_packages'
                          ? consoleOutput.contents.length > 0
                            ? consoleOutput.contents.map((content, idx) =>
                                content.type === 'text' ? (
                                  <div key={idx}>{content.value}</div>
                                ) : null
                              )
                            : getStatusMessage('loading_packages', consoleOutput.language)
                          : null}
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-2 overflow-x-scroll">
                    {consoleOutput.executionTime && (
                      <div className="text-xs text-muted-foreground mb-1">
                        ⏱️ Execution time: {consoleOutput.executionTime}ms
                      </div>
                    )}
                    {consoleOutput.contents.map((content, contentIndex) => {
                      const formatting = formatContent(content, consoleOutput.language);
                      
                      if (content.type === 'image') {
                        return (
                          <picture key={`${consoleOutput.id}-${contentIndex}`}>
                            <img
                              src={content.value}
                              alt="output"
                              className="rounded-md max-w-screen-toast-mobile w-full"
                            />
                          </picture>
                        );
                      }
                      
                      if (content.type === 'html') {
                        return (
                          <div
                            key={`${consoleOutput.id}-${contentIndex}`}
                            className="border rounded p-2 bg-white dark:bg-zinc-800"
                            dangerouslySetInnerHTML={{ __html: content.value }}
                          />
                        );
                      }
                      
                      return (
                        <div
                          key={`${consoleOutput.id}-${contentIndex}`}
                          className={cn(
                            'whitespace-pre-line break-words w-full',
                            formatting.className
                          )}
                        >
                          {formatting.prefix}{content.value}
                          {content.timestamp && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {new Date(content.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </>
  ) : null;
}