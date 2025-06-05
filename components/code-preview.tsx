//components/code-preview.tsx
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { CrossSmallIcon, EyeIcon, RefreshCwIcon } from './icons';

export type PreviewLanguage = 'html' | 'react' | 'javascript' | 'css';

interface CodePreviewProps {
  code: string;
  language: PreviewLanguage;
  isVisible: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function CodePreview({ 
  code, 
  language, 
  isVisible, 
  onClose, 
  onRefresh 
}: CodePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generatePreviewContent = (code: string, language: PreviewLanguage): string => {
    switch (language) {
      case 'html':
        // For HTML, wrap in a complete document if not already
        if (!code.toLowerCase().includes('<!doctype') && !code.toLowerCase().includes('<html')) {
          return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
        body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body>
    ${code}
</body>
</html>`;
        }
        return code;

      case 'react':
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Preview</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
        .error { color: red; padding: 16px; background: #fee; border: 1px solid #fcc; border-radius: 4px; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        try {
            const { useState, useEffect, useRef } = React;
            
            ${code}
            
            // Try to render the component
            const rootElement = document.getElementById('root');
            if (typeof App !== 'undefined') {
                ReactDOM.render(<App />, rootElement);
            } else {
                // Look for any React component in the code
                const componentMatch = code.match(/(?:function|const)\\s+(\\w+)\\s*(?:\\(|=)/);
                if (componentMatch) {
                    const ComponentName = componentMatch[1];
                    if (window[ComponentName]) {
                        ReactDOM.render(React.createElement(window[ComponentName]), rootElement);
                    }
                } else {
                    rootElement.innerHTML = '<div class="error">No React component found. Please define a component (e.g., function App() { ... })</div>';
                }
            }
        } catch (error) {
            document.getElementById('root').innerHTML = '<div class="error">Error: ' + error.message + '</div>';
            console.error('Preview Error:', error);
        }
    </script>
</body>
</html>`;

      case 'javascript':
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JavaScript Preview</title>
    <style>
        body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
        .console { background: #f5f5f5; padding: 12px; border-radius: 4px; margin-top: 16px; }
        .error { color: red; }
    </style>
</head>
<body>
    <div id="output"></div>
    <div id="console-output" class="console" style="display: none;">
        <strong>Console Output:</strong>
        <div id="console-content"></div>
    </div>
    
    <script>
        // Override console methods to capture output
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        const consoleOutput = document.getElementById('console-content');
        const consoleContainer = document.getElementById('console-output');
        
        function addToConsole(message, type = 'log') {
            consoleContainer.style.display = 'block';
            const div = document.createElement('div');
            div.className = type === 'error' ? 'error' : '';
            div.textContent = typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message);
            consoleOutput.appendChild(div);
        }
        
        console.log = (...args) => {
            originalLog.apply(console, args);
            addToConsole(args.join(' '), 'log');
        };
        
        console.error = (...args) => {
            originalError.apply(console, args);
            addToConsole(args.join(' '), 'error');
        };
        
        console.warn = (...args) => {
            originalWarn.apply(console, args);
            addToConsole(args.join(' '), 'warn');
        };
        
        try {
            ${code}
        } catch (error) {
            console.error('Runtime Error:', error.message);
            document.getElementById('output').innerHTML = '<div class="error">Error: ' + error.message + '</div>';
        }
    </script>
</body>
</html>`;

      case 'css':
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Preview</title>
    <style>
        ${code}
    </style>
</head>
<body>
    <div class="preview-container">
        <h1>CSS Preview</h1>
        <p>This is a sample paragraph to demonstrate your CSS styles.</p>
        <div class="box">Sample Box</div>
        <button>Sample Button</button>
        <ul>
            <li>List item 1</li>
            <li>List item 2</li>
            <li>List item 3</li>
        </ul>
    </div>
</body>
</html>`;

      default:
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
</head>
<body>
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        <h3>Preview not available for this language</h3>
        <p>Preview is only available for HTML, React, JavaScript, and CSS code.</p>
    </div>
</body>
</html>`;
    }
  };

  useEffect(() => {
    if (isVisible && iframeRef.current) {
      setIsLoading(true);
      setError(null);
      
      try {
        const previewContent = generatePreviewContent(code, language);
        const blob = new Blob([previewContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        iframeRef.current.src = url;
        
        const handleLoad = () => {
          setIsLoading(false);
          URL.revokeObjectURL(url);
        };
        
        const handleError = () => {
          setIsLoading(false);
          setError('Failed to load preview');
          URL.revokeObjectURL(url);
        };
        
        iframeRef.current.addEventListener('load', handleLoad);
        iframeRef.current.addEventListener('error', handleError);
        
        return () => {
          if (iframeRef.current) {
            iframeRef.current.removeEventListener('load', handleLoad);
            iframeRef.current.removeEventListener('error', handleError);
          }
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        setError('Failed to generate preview');
        setIsLoading(false);
      }
    }
  }, [code, language, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <EyeIcon size={20} />
            <h2 className="text-lg font-semibold">
              {language.charAt(0).toUpperCase() + language.slice(1)} Preview
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCwIcon size={16} />
                Refresh
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <CrossSmallIcon size={16} />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          )}
          
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-500 mb-2">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0 rounded-b-lg"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
              title={`${language} preview`}
            />
          )}
        </div>
      </div>
    </div>
  );
}