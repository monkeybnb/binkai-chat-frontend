"use client";

import { FC, memo } from "react";
import ReactMarkdown, { Options } from "react-markdown";

type MarkdownProps = Options & { className?: string };

export const MessageMarkdownMemoized: FC<MarkdownProps> = memo(
  ReactMarkdown as FC<MarkdownProps>,
  (prevProps: MarkdownProps, nextProps: MarkdownProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);
