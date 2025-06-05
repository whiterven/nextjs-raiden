'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

// Language detection helper
const getLanguageFromClassName = (className: string): string => {
  const match = className?.match(/language-(\w+)/);
  return match ? match[1] : '';
};

// Syntax highlighting for different languages
const highlightCode = (code: string, language: string): string => {
  const codeString = String(code).replace(/\n$/, '');
  
  // Define color patterns for different languages
  const patterns = {
    // JavaScript/TypeScript patterns
    javascript: [
      { regex: /(function|const|let|var|if|else|for|while|return|import|export|from|class|extends|async|await|try|catch|finally)\b/g, style: 'text-purple-400' },
      { regex: /(true|false|null|undefined)\b/g, style: 'text-orange-400' },
      { regex: /(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, style: 'text-green-400' },
      { regex: /\/\/.*$/gm, style: 'text-gray-500 italic' },
      { regex: /\/\*[\s\S]*?\*\//g, style: 'text-gray-500 italic' },
      { regex: /\b\d+\.?\d*\b/g, style: 'text-blue-400' },
    ],
    
    // TypeScript specific
    typescript: [
      { regex: /(function|const|let|var|if|else|for|while|return|import|export|from|class|extends|interface|type|enum|async|await|try|catch|finally)\b/g, style: 'text-purple-400' },
      { regex: /(true|false|null|undefined|string|number|boolean|object|any|void)\b/g, style: 'text-orange-400' },
      { regex: /(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, style: 'text-green-400' },
      { regex: /\/\/.*$/gm, style: 'text-gray-500 italic' },
      { regex: /\/\*[\s\S]*?\*\//g, style: 'text-gray-500 italic' },
      { regex: /\b\d+\.?\d*\b/g, style: 'text-blue-400' },
    ],

    // Python patterns
    python: [
      { regex: /(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|lambda|and|or|not|in|is)\b/g, style: 'text-purple-400' },
      { regex: /(True|False|None)\b/g, style: 'text-orange-400' },
      { regex: /(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, style: 'text-green-400' },
      { regex: /#.*$/gm, style: 'text-gray-500 italic' },
      { regex: /\b\d+\.?\d*\b/g, style: 'text-blue-400' },
      { regex: /@\w+/g, style: 'text-yellow-400' },
    ],

    // HTML patterns
    html: [
      { regex: /(&lt;\/?)(\w+)([^&]*?)(&gt;)/g, style: 'text-blue-400' },
      { regex: /(\w+)(=)(['"][^'"]*['"])/g, style: 'text-yellow-400' },
      { regex: /&lt;!--[\s\S]*?--&gt;/g, style: 'text-gray-500 italic' },
    ],

    // CSS patterns
    css: [
      { regex: /([.#]?[\w-]+)\s*{/g, style: 'text-yellow-400' },
      { regex: /([\w-]+)\s*:/g, style: 'text-blue-400' },
      { regex: /:\s*([^;]+);/g, style: 'text-green-400' },
      { regex: /\/\*[\s\S]*?\*\//g, style: 'text-gray-500 italic' },
      { regex: /#[0-9a-fA-F]{3,6}\b/g, style: 'text-pink-400' },
    ],

    // React/JSX patterns
    react: [
      { regex: /(function|const|let|var|if|else|for|while|return|import|export|from|class|extends|async|await|try|catch|finally)\b/g, style: 'text-purple-400' },
      { regex: /(true|false|null|undefined)\b/g, style: 'text-orange-400' },
      { regex: /(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, style: 'text-green-400' },
      { regex: /\/\/.*$/gm, style: 'text-gray-500 italic' },
      { regex: /\/\*[\s\S]*?\*\//g, style: 'text-gray-500 italic' },
      { regex: /&lt;[^&]*?&gt;/g, style: 'text-blue-400' },
      { regex: /\b\d+\.?\d*\b/g, style: 'text-blue-400' },
    ],
  };

  // Apply syntax highlighting
  let highlightedCode = codeString;
  const languagePatterns = patterns[language as keyof typeof patterns] || patterns.javascript;

  languagePatterns.forEach(({ regex, style }) => {
    highlightedCode = highlightedCode.replace(regex, `<span class="${style}">$&</span>`);
  });

  return highlightedCode;
};

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  
  const code = String(children).replace(/\n$/, '');
  const language = getLanguageFromClassName(className || '');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (inline) {
    return (
      <code
        className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
        {...props}
      >
        {children}
      </code>
    );
  }

  const highlightedCode = language ? highlightCode(code, language) : code;

  return (
    <div className="not-prose flex flex-col my-6">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-t-xl">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
          {language || 'text'}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-100 transition-colors rounded"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} />
              Copied
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy
            </>
          )}
        </button>
      </div>
      
      {/* Code content */}
      <pre
        {...props}
        className="text-sm w-full overflow-x-auto bg-zinc-900 dark:bg-zinc-950 p-4 border-l border-r border-b border-zinc-200 dark:border-zinc-700 rounded-b-xl text-zinc-100 font-mono"
      >
        <code 
          className="whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ 
            __html: language ? highlightedCode : code 
          }}
        />
      </pre>
    </div>
  );
}