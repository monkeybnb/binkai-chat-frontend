//ts-ignore
"use client";

import { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

SyntaxHighlighter.registerLanguage("javascript", js);

interface MessageMarkdownProps {
  content: string;
}

type CodeComponentProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

export const MessageMarkdown = ({ content }: MessageMarkdownProps) => {
  // Process content to ensure addresses are treated as inline code
  const processedContent = content.replace(/```([^`]+)```/g, (match, code) => {
    // If it's an address, convert to inline code
    if (
      (code.startsWith("0x") && code.length >= 40) ||
      /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(code)
    ) {
      return `\`${code}\``;
    }
    return match;
  });

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: ({ inline, className, children }: CodeComponentProps) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "javascript";
            const code = String(children).trim();

            // Check if the code is an address
            const isEthAddress = code.startsWith("0x") && code.length >= 40;
            const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(code);

            // Force syntax highlighting for addresses
            const shouldHighlight = isEthAddress || isSolanaAddress;

            // Render addresses as inline code regardless of how they were marked up
            if (shouldHighlight) {
              return (
                <div className="relative inline-flex group">
                  <code className="rounded-xl px-2 py-1 bg-muted text-[rgb(64,160,112)]">
                    {code}
                  </code>
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(code);
                        toast.success("Copied to clipboard");
                      }}
                      className="ml-1 text-xs bg-muted hover:bg-muted/80 rounded-lg px-2 py-1"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              );
            }

            return !inline ? (
              <div className="relative group rounded-xl overflow-hidden max-w-screen">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(code);
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
                    maxWidth: "80vw",
                  }}
                  wrapLongLines
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            ) : (
              <div className="relative inline-flex group">
                <code className="rounded-xl px-2 py-1 bg-muted">{code}</code>
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(code);
                    }}
                    className="ml-1 text-xs bg-muted hover:bg-muted/80 rounded-lg px-2 py-1"
                  >
                    Copy
                  </button>
                </div>
              </div>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
