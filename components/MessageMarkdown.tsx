//ts-ignore
"use client";

import { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

SyntaxHighlighter.registerLanguage("javascript", js);

interface MessageMarkdownProps {
  content: string;
}

type CodeComponentProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

export const MessageMarkdown = ({ content }: MessageMarkdownProps) => {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: ({ inline, className, children }: CodeComponentProps) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "javascript";

            return !inline ? (
              <div className="relative group rounded-xl overflow-hidden">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(String(children));
                    }}
                    className="text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80"
                  >
                    Copy
                  </button>
                </div>
                {/* @ts-ignore */}
                <SyntaxHighlighter
                  style={docco}
                  language={language}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: "12px",
                    background: "transparent",
                  }}
                  wrapLongLines
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={`${className} rounded-xl px-2 py-1 bg-muted`}>
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
};
