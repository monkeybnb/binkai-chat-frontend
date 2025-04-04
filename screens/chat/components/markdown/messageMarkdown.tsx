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
    <MessageMarkdownMemoized
      // className="prose prose-p:leading-relaxed prose-p:!text-black prose-table:!text-gray-800 prose-pre:p-0 min-w-full space-y-5 break-words"
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        code({ className, children, ...props }) {
          const childArray = React.Children.toArray(children);
          const firstChild = childArray[0] as React.ReactElement;
          const firstChildAsString = React.isValidElement(firstChild)
            ? (firstChild as React.ReactElement).props.children
            : firstChild;

          if (firstChildAsString === "▍") {
            return <span className="mt-1 animate-pulse cursor-default">▍</span>;
          }

          if (typeof firstChildAsString === "string") {
            childArray[0] = firstChildAsString.replace("`▍`", "▍");
          }

          const match = /language-(\w+)/.exec(className || "");

          if (
            typeof firstChildAsString === "string" &&
            !firstChildAsString.includes("\n")
          ) {
            return (
              <code
                className={`bg-primary text-white px-1 py-[2px] before:hidden after:hidden rounded-md ${className}`}
                {...props}
              >
                {childArray}
              </code>
            );
          }

          return (
            <MessageCodeBlock
              language={(match && match[1]) || ""}
              value={String(childArray).replace(/\n$/, "")}
              {...props}
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
  );
};
