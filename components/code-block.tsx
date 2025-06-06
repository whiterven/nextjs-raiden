'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, Copy } from 'lucide-react';

// CodeMirror imports
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Extension } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';
import { markdown } from '@codemirror/lang-markdown';
import { php } from '@codemirror/lang-php';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';

interface CodeBlockProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: any;
}

// Language detection helper
const getLanguageFromClassName = (className: string): string => {
  const match = className?.match(/language-(\w+)/);
  return match ? match[1] : '';
};

// Language extension mapping
const getLanguageExtension = (language: string): Extension[] => {
  const langMap: Record<string, Extension[]> = {
    javascript: [javascript()],
    js: [javascript()],
    typescript: [javascript({ typescript: true })],
    ts: [javascript({ typescript: true })],
    jsx: [javascript({ jsx: true })],
    tsx: [javascript({ typescript: true, jsx: true })],
    python: [python()],
    py: [python()],
    html: [html()],
    css: [css()],
    json: [json()],
    sql: [sql()],
    xml: [xml()],
    markdown: [markdown()],
    md: [markdown()],
    php: [php()],
    cpp: [cpp()],
    c: [cpp()],
    java: [java()],
    rust: [rust()],
    rs: [rust()],
    go: [go()],
  };

  return langMap[language.toLowerCase()] || [];
};

// Simple syntax highlighter fallback for when CodeMirror is not available
const highlightCodeFallback = (code: string, language: string): string => {
  // Basic HTML escaping
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  let highlightedCode = escapeHtml(code);

  const patterns = {
    javascript: [
      { regex: /\/\/.*$/gm, className: 'text-gray-500 italic' },
      { regex: /\/\*[\s\S]*?\*\//g, className: 'text-gray-500 italic' },
      { regex: /(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, className: 'text-emerald-400' },
      { regex: /\b\d+\.?\d*\b/g, className: 'text-cyan-400' },
      { regex: /\b(function|const|let|var|if|else|for|while|return|import|export|class|async|await)\b/g, className: 'text-purple-400 font-medium' },
      { regex: /\b(true|false|null|undefined)\b/g, className: 'text-orange-400' },
    ],
    python: [
      { regex: /#.*$/gm, className: 'text-gray-500 italic' },
      { regex: /(['"`])((?:\\.|[^'"`\\])*?)\1/g, className: 'text-emerald-400' },
      { regex: /\b\d+\.?\d*\b/g, className: 'text-cyan-400' },
      { regex: /\b(def|class|if|elif|else|for|while|try|except|import|return|and|or|not)\b/g, className: 'text-purple-400 font-medium' },
      { regex: /\b(True|False|None)\b/g, className: 'text-orange-400' },
    ],
    html: [
      { regex: /&lt;!--[\s\S]*?--&gt;/g, className: 'text-gray-500 italic' },
      { regex: /&lt;\/?([\w-]+)/g, className: 'text-red-400' },
      { regex: /\s([\w-]+)=/g, className: 'text-yellow-400' },
      { regex: /=(['"`])(.*?)\1/g, className: 'text-emerald-400' },
    ],
  };

  const languagePatterns = patterns[language as keyof typeof patterns] || [];

  languagePatterns.forEach(({ regex, className }) => {
    highlightedCode = highlightedCode.replace(regex, (match) => {
      return `<span class="${className}">${match}</span>`;
    });
  });

  return highlightedCode;
};

export function CodeBlock({ node, inline, className, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [useCodeMirror, setUseCodeMirror] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  
  const code = String(children).replace(/\n$/, '');
  const language = getLanguageFromClassName(className || '');

  useEffect(() => {
    if (!inline && editorRef.current && useCodeMirror) {
      try {
        // Clean up previous editor
        if (viewRef.current) {
          viewRef.current.destroy();
        }

        const languageExtensions = getLanguageExtension(language);
        
        const state = EditorState.create({
          doc: code,
          extensions: [
            basicSetup,
            oneDark,
            ...languageExtensions,
            EditorView.editable.of(false),
            EditorView.theme({
              '&': {
                fontSize: '14px',
              },
              '.cm-content': {
                padding: '12px',
                minHeight: 'auto',
              },
              '.cm-focused': {
                outline: 'none',
              },
              '.cm-editor': {
                borderRadius: '0 0 0.75rem 0.75rem',
              },
              '.cm-scroller': {
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
              },
            }),
          ],
        });

        viewRef.current = new EditorView({
          state,
          parent: editorRef.current,
        });
      } catch (error) {
        console.warn('CodeMirror failed to load, falling back to basic highlighting:', error);
        setUseCodeMirror(false);
      }
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [code, language, inline, useCodeMirror]);

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

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between bg-zinc-800 px-4 py-3 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-300 ml-2">
            {language || 'text'}
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 rounded-md bg-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-100"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy
            </>
          )}
        </button>
      </div>
      
      {/* Code content */}
      {useCodeMirror ? (
        <div ref={editorRef} className="overflow-hidden" />
      ) : (
        <pre className="overflow-x-auto bg-zinc-900 p-4 text-sm leading-relaxed">
          <code 
            className="font-mono text-zinc-100"
            dangerouslySetInnerHTML={{ 
              __html: highlightCodeFallback(code, language)
            }}
          />
        </pre>
      )}
    </div>
  );
}