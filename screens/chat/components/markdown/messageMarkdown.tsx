"use client";

import React, { FC } from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { MessageCodeBlock } from "./messageCodeblock";
import { MessageMarkdownMemoized } from "./messageMarkdownMemo";

interface MessageMarkdownProps {
  content: string;
}

export const MessageMarkdown: FC<MessageMarkdownProps> = ({ content }) => {
  return (
    <div className="prose prose-p:leading-relaxed prose-p:!text-black prose-table:!text-gray-800 prose-pre:p-0 min-w-full space-y-5 break-words">
      <MessageMarkdownMemoized
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
          code(props) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            const childArray = React.Children.toArray(children);
            const firstChild = childArray[0];
            const isInline = !match && !className;

            if (typeof firstChild === "string") {
              if (firstChild === "▍") {
                return (
                  <span className="mt-1 animate-pulse cursor-default">▍</span>
                );
              }

              // Handle inline code
              if (isInline) {
                return (
                  <span className="font-mono text-gray-800" {...rest}>
                    {firstChild}
                  </span>
                );
              }

              // Handle single-line code blocks
              if (!firstChild.includes("\n")) {
                return (
                  <code
                    className={`bg-primary text-white px-1 py-[2px] before:hidden after:hidden rounded-md ${
                      className || ""
                    }`}
                    {...rest}
                  >
                    {firstChild}
                  </code>
                );
              }
            }

            // Handle multi-line code blocks
            return (
              <MessageCodeBlock
                language={(match && match[1]) || ""}
                value={String(children).replace(/\n$/, "")}
                {...rest}
              />
            );
          },
          p({ children }) {
            return (
              <p className="whitespace-pre-line !mt-2 first-of-type:!mt-0">
                {children}
              </p>
            );
          },
          img({ ...props }) {
            return <img className="max-w-[67%]" {...props} />;
          },
        }}
      >
        {content}
      </MessageMarkdownMemoized>
    </div>
  );
};
