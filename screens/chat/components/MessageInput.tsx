"use client";

import { ArrowUp, StopFill } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/stores";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useRef } from "react";

const ENTER_KEY = "Enter";

interface MessageInputProps {
  message: string;
  setMessage: any;
  onSendMessage: () => void;
  threadId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  onSendMessage,
  threadId,
}) => {
  const { isAuthenticated } = useAuthStore();
  const { isLoading, isSending } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChangeQuestion = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isSending[threadId]) return;

    setMessage(e.target.value);
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (isSending[threadId]) return;
    if (event.ctrlKey && event.key === ENTER_KEY) {
      event.preventDefault();
      setMessage((prevMsg: string) => `${prevMsg}\n`);
      return;
    }

    if (event.key === ENTER_KEY && !event.shiftKey) {
      event.preventDefault();
      onSendMessage();
      setMessage("");
    }
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "36px";
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(scrollHeight, 376)}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [message]);

  return (
    <div className="flex pt-6 pb-4 gap-1 flex-col items-center max-w-[720px] w-full mx-auto px-6">
      <div className="flex gap-4 w-full flex-1 border rounded-xl px-4 py-3">
        <Textarea
          autoFocus
          ref={textareaRef}
          placeholder="Ask anything"
          className="px-0 py-1.5 border-none min-h-[36px] max-h-[176px] md:max-h-[376px] resize-none custom-scrollbar leading-6 text-body-medium focus-visible:ring-transparent focus-visible:ring-0 caret-primary"
          value={message}
          onChange={handleChangeQuestion}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        {isLoading ? (
          <Button
            onClick={() => {
              textareaRef.current?.focus();
            }}
            variant="secondary"
            size="icon"
            className="w-9 h-9 aspect-square"
          >
            <StopFill />
          </Button>
        ) : (
          <Button
            className="aspect-square h-9 w-9 disabled:bg-muted disabled:text-muted-foreground"
            size="icon"
            variant="default"
            onClick={() => {
              onSendMessage();
              textareaRef.current?.focus();
            }}
            disabled={
              !message.trim() || !isAuthenticated || isSending[threadId]
            }
          >
            <ArrowUp />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-1 text-body-xsmall text-muted-foreground pt-2">
        BinkAI can make mistakes. Check important information.
      </div>
    </div>
  );
};

export default MessageInput;
