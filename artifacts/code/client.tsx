//artifacts/code/client.tsx
import { Artifact } from '@/components/create-artifact';
import { CodeEditor, supportsPreview, supportsExecution, Language } from '@/components/code-editor';
import { CodePreview, PreviewLanguage } from '@/components/code-preview';
import {
  CopyIcon,
  LogsIcon,
  MessageIcon,
  PlayIcon,
  RedoIcon,
  UndoIcon,
  EyeIcon,
} from '@/components/icons';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';
import {
  Console,
  ConsoleOutput,
  ConsoleOutputContent,
} from '@/components/console';
import { useState, useEffect } from 'react';

// Output handlers for different languages
const OUTPUT_HANDLERS = {
  matplotlib: `
    import io
    import base64
    from matplotlib import pyplot as plt

    # Clear any existing plots
    plt.clf()
    plt.close('all')

    # Switch to agg backend
    plt.switch_backend('agg')

    def setup_matplotlib_output():
        def custom_show():
            if plt.gcf().get_size_inches().prod() * plt.gcf().dpi ** 2 > 25_000_000:
                print("Warning: Plot size too large, reducing quality")
                plt.gcf().set_dpi(100)

            png_buf = io.BytesIO()
            plt.savefig(png_buf, format='png')
            png_buf.seek(0)
            png_base64 = base64.b64encode(png_buf.read()).decode('utf-8')
            print(f'data:image/png;base64,{png_base64}')
            png_buf.close()

            plt.clf()
            plt.close('all')

        plt.show = custom_show
  `,
  basic: `
    # Basic output capture setup
  `,
};

// Language execution engines
const LANGUAGE_ENGINES = {
  python: {
    setup: async () => {
      // @ts-expect-error - loadPyodide is not defined
      return await globalThis.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
      });
    },
    loadPackages: async (engine: any, code: string, messageCallback: (msg: string) => void) => {
      await engine.loadPackagesFromImports(code, { messageCallback });
    },
    execute: async (engine: any, code: string) => {
      const requiredHandlers = detectRequiredHandlers(code);
      for (const handler of requiredHandlers) {
        if (OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS]) {
          await engine.runPythonAsync(
            OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS],
          );
          if (handler === 'matplotlib') {
            await engine.runPythonAsync('setup_matplotlib_output()');
          }
        }
      }
      await engine.runPythonAsync(code);
    },
    setOutput: (engine: any, callback: (output: string) => void) => {
      engine.setStdout({
        batched: callback,
      });
    }
  },
  javascript: {
    setup: async () => {
      return {
        logs: [],
        originalConsole: {
          log: console.log,
          error: console.error,
          warn: console.warn,
        }
      };
    },
    loadPackages: async () => {
      // JavaScript doesn't need package loading
    },
    execute: async (engine: any, code: string) => {
      // Create a safe execution context
      const func = new Function('console', code);
      func(engine.console);
    },
    setOutput: (engine: any, callback: (output: string) => void) => {
      engine.console = {
        log: (...args: any[]) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          callback(message);
          engine.originalConsole.log.apply(console, args);
        },
        error: (...args: any[]) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          callback(`ERROR: ${message}`);
          engine.originalConsole.error.apply(console, args);
        },
        warn: (...args: any[]) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          callback(`WARNING: ${message}`);
          engine.originalConsole.warn.apply(console, args);
        }
      };
    }
  }
};

function detectRequiredHandlers(code: string): string[] {
  const handlers: string[] = ['basic'];

  if (code.includes('matplotlib') || code.includes('plt.')) {
    handlers.push('matplotlib');
  }

  return handlers;
}

interface Metadata {
  outputs: Array<ConsoleOutput>;
  language: Language;
  showPreview: boolean;
}

// Helper function to determine if content is React code
function isReactCode(code: string): boolean {
  return (
    code.includes('import React') ||
    code.includes('from react') ||
    code.includes('useState') ||
    code.includes('useEffect') ||
    code.includes('jsx') ||
    code.includes('<') && code.includes('/>') ||
    code.includes('function') && code.includes('return') && code.includes('<')
  );
}

// Helper function to detect if code should only be previewed rather than executed
function shouldOnlyPreview(language: Language, code: string): boolean {
  return (
    ['html', 'css'].includes(language) || 
    (language === 'javascript' && (code.includes('document.') || code.includes('window.')))
  );
}

export const codeArtifact = new Artifact<'code', Metadata>({
  kind: 'code',
  description:
    'Useful for code generation with execution support for Python, JavaScript, HTML, and CSS. Includes live preview for web technologies.',
  initialize: async ({ setMetadata, language }) => {
    setMetadata({
      outputs: [],
      language: language as Language || 'python',
      showPreview: false,
    });
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'code-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible:
          draftArtifact.status === 'streaming' &&
          draftArtifact.content.length > 300 &&
          draftArtifact.content.length < 310
            ? true
            : draftArtifact.isVisible,
        status: 'streaming',
      }));
    }
  },
  content: ({ metadata, setMetadata, language = 'python', ...props }) => {
    const [showPreview, setShowPreview] = useState(metadata?.showPreview || false);
    
    const currentLanguage = metadata?.language || language as Language;
    const previewLanguage: PreviewLanguage = isReactCode(props.content) 
      ? 'react' 
      : currentLanguage as PreviewLanguage;

    // Automatically show preview for HTML/CSS content
    useEffect(() => {
      if ((currentLanguage === 'html' || currentLanguage === 'css') && !showPreview) {
        setShowPreview(true);
        setMetadata((prevMetadata) => ({
          ...prevMetadata,
          showPreview: true,
        }));
      }
    }, [currentLanguage, showPreview, setMetadata]);

    return (
      <>
        <div className="px-1">
          <CodeEditor {...props} language={currentLanguage} />
        </div>

        {metadata?.outputs && (
          <Console
            consoleOutputs={metadata.outputs}
            setConsoleOutputs={() => {
              setMetadata({
                ...metadata,
                outputs: [],
              });
            }}
          />
        )}

        {showPreview && supportsPreview(currentLanguage) && (
          <CodePreview
            code={props.content}
            language={previewLanguage}
            isVisible={showPreview}
            onClose={() => {
              setShowPreview(false);
              setMetadata({
                ...metadata,
                showPreview: false,
              });
            }}
            onRefresh={() => {
              // Force refresh by toggling preview
              setShowPreview(false);
              setTimeout(() => setShowPreview(true), 100);
            }}
          />
        )}
      </>
    );
  },
  actions: [
    {
      icon: <PlayIcon size={18} />,
      label: 'Run',
      description: 'Execute code',
      onClick: async ({ content, setMetadata, language = 'python' }) => {
        const codeLanguage = language as Language;
        
        if (!supportsExecution(codeLanguage)) {
          toast.error(`Execution not supported for ${language}`);
          return;
        }
        
        // For HTML/CSS content, trigger preview instead of execution
        if (shouldOnlyPreview(codeLanguage, content)) {
          setMetadata((metadata) => ({
            ...metadata,
            showPreview: true,
          }));
          toast.success(`Showing ${language} preview instead of execution`);
          return;
        }

        const runId = generateUUID();
        const outputContent: Array<ConsoleOutputContent> = [];

        setMetadata((metadata) => ({
          ...metadata,
          outputs: [
            ...metadata.outputs,
            {
              id: runId,
              contents: [],
              status: 'in_progress',
            },
          ],
        }));

        try {
          const engineConfig = LANGUAGE_ENGINES[codeLanguage as keyof typeof LANGUAGE_ENGINES];
          
          if (!engineConfig) {
            throw new Error(`No execution engine available for ${language}`);
          }

          const engine = await engineConfig.setup();

          // Set up output capture
          engineConfig.setOutput(engine, (output: string) => {
            outputContent.push({
              type: output.startsWith('data:image/png;base64')
                ? 'image'
                : 'text',
              value: output,
            });
          });

          // Load packages if needed
          if (engineConfig.loadPackages) {
            await engineConfig.loadPackages(engine, content, (message: string) => {
              setMetadata((metadata) => ({
                ...metadata,
                outputs: [
                  ...metadata.outputs.filter((output) => output.id !== runId),
                  {
                    id: runId,
                    contents: [{ type: 'text', value: message }],
                    status: 'loading_packages',
                  },
                ],
              }));
            });
          }

          // Execute the code
          await engineConfig.execute(engine, content);

          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: outputContent,
                status: 'completed',
              },
            ],
          }));

          toast.success(`${language.charAt(0).toUpperCase() + language.slice(1)} code executed successfully!`);
        } catch (error: any) {
          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: [{ type: 'text', value: error.message }],
                status: 'failed',
              },
            ],
          }));
          toast.error(`Execution failed: ${error.message}`);
        }
      },
      isDisabled: ({ language = 'python' }) => !supportsExecution(language as Language),
    },
    {
      icon: <EyeIcon size={18} />,
      label: 'Preview',
      description: 'Preview code in browser',
      onClick: ({ setMetadata, language = 'python' }) => {
        const codeLanguage = language as Language;
        if (!supportsPreview(codeLanguage)) {
          toast.error(`Preview not supported for ${language}`);
          return;
        }

        setMetadata((metadata) => ({
          ...metadata,
          showPreview: true,
        }));
      },
      isDisabled: ({ language = 'python' }) => !supportsPreview(language as Language),
    },
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
      icon: <CopyIcon size={18} />,
      description: 'Copy code to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
      },
    },
  ],
  toolbar: [
    {
      icon: <MessageIcon />,
      description: 'Add comments',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Add comments to the code snippet for understanding',
        });
      },
    },
    {
      icon: <LogsIcon />,
      description: 'Add logs',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Add logs to the code snippet for debugging',
        });
      },
    },
  ],
});