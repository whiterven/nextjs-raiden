//components/code-editor.tsx
'use client';

import { EditorView } from '@codemirror/view';
import { EditorState, Transaction } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { sql } from '@codemirror/lang-sql';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';
import React, { memo, useEffect, useRef } from 'react';
import { Suggestion } from '@/lib/db/schema';

export type Language = 'python' | 'javascript' | 'html' | 'css' | 'json' | 'sql' | 'java';

type EditorProps = {
  content: string;
  language?: Language;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: 'streaming' | 'idle';
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  suggestions: Array<Suggestion>;
};

// Language extension mapping
const getLanguageExtension = (language: Language) => {
  switch (language) {
    case 'python':
      return python();
    case 'javascript':
      return javascript();
    case 'html':
      return html();
    case 'css':
      return css();
    case 'json':
      return json();
    case 'sql':
      return sql();
    case 'java':
      return java();
    default:
      return python(); // Default fallback
  }
};

// Check if language supports preview
export const supportsPreview = (language: Language): boolean => {
  return ['html', 'javascript', 'css'].includes(language);
};

// Check if language supports execution
export const supportsExecution = (language: Language): boolean => {
  return ['python', 'javascript', 'html', 'css'].includes(language);
};

function PureCodeEditor({ 
  content, 
  language = 'python', 
  onSaveContent, 
  status 
}: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const currentLanguageRef = useRef<Language>(language);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      const startState = EditorState.create({
        doc: content,
        extensions: [basicSetup, getLanguageExtension(language), oneDark],
      });

      editorRef.current = new EditorView({
        state: startState,
        parent: containerRef.current,
      });
      
      currentLanguageRef.current = language;
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // NOTE: we only want to run this effect once
    // eslint-disable-next-line
  }, []);

  // Handle language changes
  useEffect(() => {
    if (editorRef.current && currentLanguageRef.current !== language) {
      const currentSelection = editorRef.current.state.selection;
      const currentDoc = editorRef.current.state.doc;

      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const transaction = update.transactions.find(
            (tr) => !tr.annotation(Transaction.remote),
          );

          if (transaction) {
            const newContent = update.state.doc.toString();
            onSaveContent(newContent, true);
          }
        }
      });

      const newState = EditorState.create({
        doc: currentDoc,
        extensions: [basicSetup, getLanguageExtension(language), oneDark, updateListener],
        selection: currentSelection,
      });

      editorRef.current.setState(newState);
      currentLanguageRef.current = language;
    }
  }, [language, onSaveContent]);

  useEffect(() => {
    if (editorRef.current) {
      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const transaction = update.transactions.find(
            (tr) => !tr.annotation(Transaction.remote),
          );

          if (transaction) {
            const newContent = update.state.doc.toString();
            onSaveContent(newContent, true);
          }
        }
      });

      const currentSelection = editorRef.current.state.selection;

      const newState = EditorState.create({
        doc: editorRef.current.state.doc,
        extensions: [basicSetup, getLanguageExtension(currentLanguageRef.current), oneDark, updateListener],
        selection: currentSelection,
      });

      editorRef.current.setState(newState);
    }
  }, [onSaveContent]);

  useEffect(() => {
    if (editorRef.current && content) {
      const currentContent = editorRef.current.state.doc.toString();

      if (status === 'streaming' || currentContent !== content) {
        const transaction = editorRef.current.state.update({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
          annotations: [Transaction.remote.of(true)],
        });

        editorRef.current.dispatch(transaction);
      }
    }
  }, [content, status]);

  return (
    <div
      className="relative not-prose w-full pb-[calc(80dvh)] text-sm"
      ref={containerRef}
    />
  );
}

function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
  if (prevProps.suggestions !== nextProps.suggestions) return false;
  if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex)
    return false;
  if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) return false;
  if (prevProps.status === 'streaming' && nextProps.status === 'streaming')
    return false;
  if (prevProps.content !== nextProps.content) return false;
  if (prevProps.language !== nextProps.language) return false;

  return true;
}

export const CodeEditor = memo(PureCodeEditor, areEqual);

// Language selection component
export const LanguageSelector = ({
  currentLanguage,
  onLanguageChange,
}: {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}) => {
  const languages: Array<{ value: Language; label: string }> = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'sql', label: 'SQL' },
    { value: 'java', label: 'Java' },
  ];

  return (
    <select
      value={currentLanguage}
      onChange={(e) => onLanguageChange(e.target.value as Language)}
      className="px-3 py-1 border rounded text-sm bg-white dark:bg-gray-800 dark:border-gray-600"
    >
      {languages.map((lang) => (
        <option key={lang.value} value={lang.value}>
          {lang.label}
        </option>
      ))}
    </select>
  );
};