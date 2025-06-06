//components/markdown.tsx
import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

const components: Partial<Components> = {
  code: ({ node, className, children, ...props }) => {
    // Check if it's an inline code element
    const isInline = !className || !className.includes('language-');
    
    return (
      <CodeBlock
        inline={isInline}
        className={className || ''}
        {...props}
      >
        {children}
      </CodeBlock>
    );
  },
  // Remove the pre override as CodeBlock will handle its own container
  
  // Paragraphs with shadcn/ui typography
  p: ({ node, children, ...props }) => {
    return (
      <p className="leading-7 [&:not(:first-child)]:mt-6" {...props}>
        {children}
      </p>
    );
  },

  // Blockquotes with shadcn/ui styling
  blockquote: ({ node, children, ...props }) => {
    return (
      <blockquote className="mt-6 border-l-2 pl-6 italic" {...props}>
        {children}
      </blockquote>
    );
  },

  // Tables with shadcn/ui styling
  table: ({ node, children, ...props }) => {
    return (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full" {...props}>
          {children}
        </table>
      </div>
    );
  },
  thead: ({ node, children, ...props }) => {
    return <thead {...props}>{children}</thead>;
  },
  tbody: ({ node, children, ...props }) => {
    return <tbody {...props}>{children}</tbody>;
  },
  tr: ({ node, children, ...props }) => {
    return (
      <tr className="even:bg-muted m-0 border-t p-0" {...props}>
        {children}
      </tr>
    );
  },
  th: ({ node, children, ...props }) => {
    return (
      <th 
        className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right" 
        {...props}
      >
        {children}
      </th>
    );
  },
  td: ({ node, children, ...props }) => {
    return (
      <td 
        className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right" 
        {...props}
      >
        {children}
      </td>
    );
  },

  // Lists with shadcn/ui styling
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props}>
        {children}
      </ol>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props}>
        {children}
      </ul>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="mt-2" {...props}>
        {children}
      </li>
    );
  },

  // Strong text
  strong: ({ node, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },

  // Links with conditional rendering for Next.js Link
  a: ({ node, children, href, ...props }) => {
    // Handle undefined href case
    if (!href) {
      return (
        <span className="text-blue-500 font-medium" {...props}>
          {children}
        </span>
      );
    }

    // Check if it's an external link
    const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:');

    if (isExternal) {
      return (
        <a
          href={href}
          className="text-blue-500 hover:underline font-medium underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }

    // Internal link using Next.js Link
    return (
      <Link
        href={href}
        className="text-blue-500 hover:underline font-medium underline underline-offset-4"
        {...props}
      >
        {children}
      </Link>
    );
  },

  // Headings with shadcn/ui typography
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-8 mb-4" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-8 mb-4" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-6 mb-3" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-6 mb-3" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="scroll-m-20 text-lg font-semibold tracking-tight mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="scroll-m-20 text-base font-semibold tracking-tight mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },

  // Horizontal rule
  hr: ({ node, ...props }) => {
    return <hr className="my-4 md:my-8" {...props} />;
  },
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);