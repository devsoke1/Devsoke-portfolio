"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Code2 } from "lucide-react";

interface MarkdownContentProps {
  content: string;
  className?: string;
  titleToOmit?: string;
}

export default function MarkdownContent({
  content,
  className = "",
  titleToOmit,
}: MarkdownContentProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, ...props }) => {
            const textContent = String(children).trim();
            if (titleToOmit && textContent === titleToOmit.trim()) {
              return null;
            }
            return (
              <h1
                className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg mt-8 mb-4 border-b border-brand-rose/15 pb-3"
                {...props}
              >
                {children}
              </h1>
            );
          },
          h2: ({ children, ...props }) => (
            <h2
              className="text-xl sm:text-2xl font-bold font-heading text-brand-fg mt-8 mb-3 text-brand-rose-text"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              className="text-lg font-bold font-heading text-brand-fg mt-6 mb-2"
              {...props}
            >
              {children}
            </h3>
          ),
          p: ({ children, ...props }) => (
            <p
              className="text-gray-300 leading-relaxed text-sm sm:text-base my-4"
              {...props}
            >
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul
              className="list-disc pl-6 my-4 space-y-2 text-gray-300 text-sm sm:text-base"
              {...props}
            >
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol
              className="list-decimal pl-6 my-4 space-y-2 text-gray-300 text-sm sm:text-base"
              {...props}
            >
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-gray-300" {...props}>
              {children}
            </li>
          ),
          strong: ({ children, ...props }) => (
            <strong className="font-bold text-white" {...props}>
              {children}
            </strong>
          ),
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith("http://") || href?.startsWith("https://");
            return (
              <a
                href={href}
                className="text-brand-rose-text underline hover:text-brand-fg transition-colors"
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-2 border-brand-rose pl-4 py-1 my-4 italic text-gray-400 bg-brand-rose/5 rounded-r-xl"
              {...props}
            >
              {children}
            </blockquote>
          ),
          pre: ({ children }) => (
            <div className="my-6 rounded-2xl overflow-hidden border border-brand-rose/20 bg-brand-bg shadow-xl">
              <div className="flex items-center justify-between px-4 py-2 bg-brand-card border-b border-brand-rose/15 text-xs text-gray-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Code2 size={13} className="text-brand-rose-text" /> Code Example
                </span>
              </div>
              <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-gray-200 leading-relaxed">
                {children}
              </pre>
            </div>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName && typeof children === "string" && !children.includes("\n");
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-brand-bg border border-brand-rose/20 text-brand-rose-text font-mono text-xs"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={codeClassName} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
