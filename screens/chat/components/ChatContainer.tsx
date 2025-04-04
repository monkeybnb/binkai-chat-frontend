"use client";

import { ArrowUp, Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useScroll } from "@/hooks/useScroll";
import { cn } from "@/lib/utils";
import {
  Message as MessageType,
  useChatStore,
  useThreadMessages,
  useThreadRouter,
} from "@/stores";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Message } from "./Message";
import MessageInput from "./MessageInput";
type Status = "IDLE" | "GENERATING";

const HomeContent = () => {
  const [message, setMessage] = useState("");
  const { sendMessage } = useChatStore();
  const { navigateToThread } = useThreadRouter();

  const handleSendMessage = async () => {
    const threadId = await sendMessage({
      message,
      threadId: null,
      setStatus: () => {},
      setMessage,
    });

    if (threadId) {
      navigateToThread(threadId);
    }
  };
  return (
    <div className="flex-1 flex flex-col overflow-hidden max-w-[720px] mx-auto w-full items-center justify-center gap-8 pb-6">
      <Logo className="w-[210px] h-[210px]" />
      <div className="flex flex-col gap-6 w-full items-stretch">
        <span className="text-heading-5 text-center">
          Hey, what can I help?
        </span>
        <MessageInput
          message={message}
          setMessage={setMessage}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

const ChatContainer = () => {
  const searchParams = useSearchParams();
  const threadId = searchParams.get("threadId") as string;

  const { messages, isLoading, hasMore, fetchMore } =
    useThreadMessages(threadId);
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<Status>("IDLE");
  const ref = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const { messagesStartRef, messagesEndRef, handleScroll, hideScroll } =
    useScroll({ status });

  const { sendMessage } = useChatStore();
  const { navigateToThread } = useThreadRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          fetchMore();
        }
      },
      {
        root: ref.current,
        threshold: 0.1,
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, fetchMore]);

  const handleSendMessage = async () => {
    setMessage("");
    const threadId = await sendMessage({
      message,
      threadId: searchParams.get("threadId"),
      setMessage,
      setStatus,
    });

    if (threadId) {
      navigateToThread(threadId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!threadId) {
    return <HomeContent />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden max-w-[720px] mx-auto w-full">
      <div className="w-full flex flex-col overflow-hidden h-full relative">
        <div
          className="overflow-auto flex flex-col-reverse w-full p-4 custom-scrollbar"
          ref={ref}
          onScroll={handleScroll}
        >
          <div className="mb-auto w-full flex flex-col">
            {hasMore && (
              <div ref={loadingRef} className="flex justify-center py-4">
                {isLoading ? (
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            <div ref={messagesStartRef} />
            {messages?.map((message: MessageType, index: number) => (
              <Message key={message.id} msg={message} index={index} />
            ))}
            {!messages?.length && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No messages yet. Start a conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <Button
          size="icon"
          variant="secondary"
          className={cn(
            `absolute bottom-0 left-1/2 -translate-x-1/2 transition-opacity`,
            {
              "opacity-0": hideScroll,
            }
          )}
          onClick={() =>
            ref.current?.scrollTo({
              top: ref.current?.scrollHeight,
              behavior: "smooth",
            })
          }
        >
          <ArrowUp className="rotate-180" />
        </Button>
      </div>
      <MessageInput
        message={message}
        setMessage={setMessage}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatContainer;
