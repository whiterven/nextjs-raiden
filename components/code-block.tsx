//components/code-block.tsx
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

// Escape HTML to prevent XSS
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Enhanced syntax highlighting with better patterns and colors
const highlightCode = (code: string, language: string): string => {
  let highlightedCode = escapeHtml(code);
  
  // Language-specific highlighting patterns with distinct colors
  const patterns = {
    javascript: [
      // Comments first (so they don't get overridden)
      { regex: /\/\/.*$/gm, replacement: '<span class="text-gray-500 italic">$&</span>' },
      { regex: /\/\*[\s\S]*?\*\//g, replacement: '<span class="text-gray-500 italic">$&</span>' },
      // Strings
      { regex: /(['"`])((?:\\.|(?!\1)[^\\\\])*?)\1/g, replacement: '<span class="text-emerald-400">$&</span>' },
      // Numbers
      { regex: /\b\d+\.?\d*\b/g, replacement: '<span class="text-cyan-400">$&</span>' },
      // Keywords
      { regex: /\b(function|const|let|var|if|else|for|while|return|import|export|from|class|extends|async|await|try|catch|finally|new|this|super|static|public|private|protected)\b/g, replacement: '<span class="text-purple-400 font-medium">$1</span>' },
      // Booleans and null
      { regex: /\b(true|false|null|undefined)\b/g, replacement: '<span class="text-orange-400">$1</span>' },
      // Function names
      { regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, replacement: '<span class="text-blue-300">$1</span>' },
    ],
    
    typescript: [
      // Comments
      { regex: /\/\/.*$/gm, replacement: '<span class="text-gray-500 italic">$&</span>' },
      { regex: /\/\*[\s\S]*?\*\//g, replacement: '<span class="text-gray-500 italic">$&</span>' },
      // Strings
      { regex: /(['"`])((?:\\.|(?!\1)[^\\\\])*?)\1/g, replacement: '<span class="text-emerald-400">$&</span>' },
      // Numbers
      { regex: /\b\d+\.?\d*\b/g, replacement: '<span class="text-cyan-400">$&</span>' },
      // TypeScript specific keywords
      { regex: /\b(interface|type|enum|implements|namespace|declare|abstract|readonly|keyof|typeof|as|is|in|extends|implements)\b/g, replacement: '<span class="text-pink-400 font-medium">$1</span>' },
      // General keywords
      { regex: /\b(function|const|let|var|if|else|for|while|return|import|export|from|class|extends|async|await|try|catch|finally|new|this|super|static|public|private|protected)\b/g, replacement: '<span class="text-purple-400 font-medium">$1</span>' },
      // Types
      { regex: /\b(string|number|boolean|object|any|void|never|unknown|Array|Promise|Date|RegExp)\b/g, replacement: '<span class="text-yellow-400">$1</span>' },
      // Booleans and null
      { regex: /\b(true|false|null|undefined)\b/g, replacement: '<span class="text-orange-400">$1</span>' },
      // Function names
      { regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, replacement: '<span class="text-blue-300">$1</span>' },
    ],

    python: [
      // Comments
      { regex: /#.*$/gm, replacement: '<span class="text-gray-500 italic">$&</span>' },
      // Strings (including f-strings)
      { regex: /f?['"`]((?:\\.|[^'"`\\\\])*?)['"`]/g, replacement: '<span class="text-emerald-400">$&</span>' },
      // Numbers
      { regex: /\b\d+\.?\d*\b/g, replacement: '<span class="text-cyan-400">$&</span>' },
      // Keywords
      { regex: /\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|lambda|and|or|not|in|is|pass|break|continue|global|nonlocal|assert|del|raise)\b/g, replacement: '<span class="text-purple-400 font-medium">$1</span>' },
      // Built-in constants
      { regex: /\b(True|False|None)\b/g, replacement: '<span class="text-orange-400">$1</span>' },
      // Decorators
      { regex: /@\w+/g, replacement: '<span class="text-yellow-400">$&</span>' },
      // Function/class names
      { regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, replacement: '<span class="text-blue-300">$1</span>' },
    ],

    html: [
      // Comments
      { regex: /&lt;!--[\s\S]*?--&gt;/g, replacement: '<span class="text-gray-500 italic">$&</span>' },
      // Tag names
      { regex: /&lt;\/?([\w-]+)/g, replacement: '&lt;<span class="text-red-400">$1</span>' },
      // Attributes
      { regex: /\s([\w-]+)=/g, replacement: ' <span class="text-yellow-400">$1</span>=' },
      // Attribute values
      { regex: /=(['"`])(.*?)\1/g, replacement: '=<span class="text-emerald-400">$1$2$1</span>' },
      // Closing tags
      { regex: /\/&gt;|&gt;/g, replacement: '<span class="text-gray-300">$&</span>' },
    ],

    css: [
      // Comments
      { regex: /\/\*[\s\S]*?\*\//g, replacement: '<span class="text-gray-500 italic">$&</span>' },
      // Selectors
      { regex: /^[\s]*([.#]?[\w-]+(?:\s*[>+~]\s*[\w-]+)*)\s*{/gm, replacement: '<span class="text-yellow-400">$1</span> {' },
      // Properties
      { regex: /([\w-]+)\s*:/g, replacement: '<span class="text-blue-400">$1</span>:' },
      // Values
      { regex: /:\s*([^;{]+);/g, replacement: ': <span class="text-emerald-400">$1</span>;' },
      // Colors
      { regex: /#[0-9a-fA-F]{3,6}\b/g, replacement: '<span class="text-pink-400">$&</span>' },
      // Units
      { regex: /\b\d+(?:px|em|rem|%|vh|vw|deg|s|ms)\b/g, replacement: '<span class="text-cyan-400">$&</span>' },
    ],

    jsx: [
      // Comments
      { regex: /\/\/.*$/gm, replacement: '<span class="text-gray-500 italic">$&</span>' },
      { regex: /\/\*[\s\S]*?\*\//g, replacement: '<span class="text-gray-500 italic">$&</span>' },
      // JSX Comments
      { regex: /{\s*\/\*[\s\S]*?\*\/\s*}/g, replacement: '<span class="text-gray-500 italic">$&</span>' },
      // Strings
      { regex: /(['"`])((?:\\.|(?!\1)[^\\\\])*?)\1/g, replacement: '<span class="text-emerald-400">$&</span>' },
      // JSX attributes
      { regex: /\s([\w-]+)=/g, replacement: ' <span class="text-yellow-400">$1</span>=' },
      // JSX tag names
      { regex: /&lt;\/?([\w.]+)/g, replacement: '&lt;<span class="text-red-400">$1</span>' },
      // Numbers
      { regex: /\b\d+\.?\d*\b/g, replacement: '<span class="text-cyan-400">$&</span>' },
      // Keywords
      { regex: /\b(function|const|let|var|if|else|for|while|return|import|export|from|class|extends|async|await|try|catch|finally|new|this|super|static|public|private|protected)\b/g, replacement: '<span class="text-purple-400 font-medium">$1</span>' },
      // React keywords
      { regex: /\b(useState|useEffect|useContext|useReducer|useMemo|useCallback|useRef|Component|PureComponent|Fragment)\b/g, replacement: '<span class="text-pink-400 font-medium">$1</span>' },
      // Booleans and null
      { regex: /\b(true|false|null|undefined)\b/g, replacement: '<span class="text-orange-400">$1</span>' },
    ],

    json: [
      // Strings (keys and values)
      { regex: /("(?:\\.|[^"\\\\])*")\s*:/g, replacement: '<span class="text-blue-400">$1</span>:' },
      { regex: /:\s*("(?:\\.|[^"\\\\])*")/g, replacement: ': <span class="text-emerald-400">$1</span>' },
      // Numbers
      { regex: /:\s*(-?\d+\.?\d*)/g, replacement: ': <span class="text-cyan-400">$1</span>' },
      // Booleans and null
      { regex: /:\s*(true|false|null)/g, replacement: ': <span class="text-orange-400">$1</span>' },
      // Brackets and braces
      { regex: /[{}[\]]/g, replacement: '<span class="text-gray-300 font-bold">$&</span>' },
    ],

    sql: [
      // Comments
      { regex: /--.*$/gm, replacement: '<span class="text-gray-500 italic">$&</span>' },
      { regex: /\/\*[\s\S]*?\*\//g, replacement: '<span class="text-gray-500 italic">$&</span>' },
      // Strings
      { regex: /('(?:[^'\\\\]|\\\\.)*')/g, replacement: '<span class="text-emerald-400">$1</span>' },
      // Keywords
      { regex: /\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP|BY|ORDER|HAVING|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|DATABASE|UNION|DISTINCT|AS|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|TRUE|FALSE|COUNT|SUM|AVG|MAX|MIN)\b/gi, replacement: '<span class="text-purple-400 font-medium">$&</span>' },
      // Numbers
      { regex: /\b\d+\.?\d*\b/g, replacement: '<span class="text-cyan-400">$&</span>' },
    ],
  };

  // Get patterns for the specified language, fallback to javascript
  const languagePatterns = patterns[language as keyof typeof patterns] || patterns.javascript;

  // Apply patterns in order
  languagePatterns.forEach(({ regex, replacement }) => {
    highlightedCode = highlightedCode.replace(regex, replacement);
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
        className="bg-zinc-800 text-zinc-100 relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
        {...props}
      >
        {children}
      </code>
    );
  }

  const highlightedCode = language ? highlightCode(code, language) : escapeHtml(code);

  return (
    <div className="not-prose flex flex-col my-6">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 dark:bg-zinc-900 border border-zinc-700 rounded-t-xl">
        <span className="text-xs font-medium text-zinc-300 uppercase tracking-wide">
          {language || 'text'}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-100 transition-colors rounded hover:bg-zinc-700"
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
        className="text-sm w-full overflow-x-auto bg-zinc-900 dark:bg-zinc-950 p-4 border-l border-r border-b border-zinc-700 rounded-b-xl text-zinc-100 font-mono leading-relaxed"
      >
        <code 
          className="whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ 
            __html: highlightedCode
          }}
        />
      </pre>
    </div>
  );
}