"use client";

import { CircleFill } from "@/components/icons";
import { Message as MessageType } from "@/stores";
import dompurify from "dompurify";
import { MessageMarkdown } from "./markdown/messageMarkdown";

interface MessageProps {
  msg: MessageType;
  index: number;
}

export const Message = ({ msg }: MessageProps) => {
  const isUser = !msg.is_ai;

  if (msg.isLoading)
    return (
      <div className="flex items-center gap-2">
        <CircleFill className="animate-scale transition-all duration-300" />
      </div>
    );

  if (isUser) {
    return (
      <div className="flex flex-col gap-2 relative pb-9">
        <div className="flex flex-col gap-3 justify-end items-end">
          <div
            className="bg-brand-50 px-6 py-3 rounded-3xl max-w-[94%] leading-7"
            dangerouslySetInnerHTML={{
              __html: dompurify.sanitize(msg.content.replace(/\n/g, "<br>")),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 relative pb-9">
      <div className="flex gap-2">
        <div className="self-start w-full relative">
          <MessageMarkdown content={msg.content} />
          {msg.error && <div className="text-red-500 text-sm">{msg.error}</div>}
        </div>
      </div>
    </div>
  );
};
