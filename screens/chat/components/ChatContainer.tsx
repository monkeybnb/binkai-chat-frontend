"use client";

import { ArrowUp, Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useNetworkConnect } from "@/hooks/useNetworkConnect";
import { useScroll } from "@/hooks/useScroll";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import {
  Message as MessageType,
  useChatStore,
  useThreadMessages,
  useThreadRouter,
} from "@/stores";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useAccount, useSendTransaction, useSignMessage } from "wagmi";
import { Message } from "./Message";
import MessageInput from "./MessageInput";
type Status = "IDLE" | "GENERATING";

const HomeContent = () => {
  const [message, setMessage] = useState("");
  const { createThread, setSending } = useChatStore();
  const { navigateToThread } = useThreadRouter();

  const handleSendMessage = async () => {
    try {
      setSending("home", true);
      const threadId = await createThread(message);
      navigateToThread(threadId);

      localStorage.setItem(
        "pendingMessage",
        JSON.stringify({ message, threadId })
      );
      setSending("home", false);
    } catch (error) {
      console.error("Error in message flow:", error);
      setSending("home", false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden max-w-[720px] mx-auto w-full items-center justify-center gap-6 pb-0 md:pb-6">
      <div className="flex flex-col gap-2 md:gap-8 w-full items-center md:flex-none flex-1 justify-center">
        <Logo className="w-[160px] h-[160px] md:w-[210px] md:h-[210px]" />
        <span className="text-heading-5 text-center">
          Hey, what can I help?
        </span>
      </div>
      <MessageInput
        message={message}
        setMessage={setMessage}
        onSendMessage={handleSendMessage}
        threadId="home"
      />
    </div>
  );
};

const ChatContainer = () => {
  const searchParams = useSearchParams();
  const threadId = searchParams.get("threadId") as string;
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("IDLE");
  const { messages, isLoading, isLoadingMore, hasMore, fetchMore } =
    useThreadMessages(threadId);
  const { address } = useAccount();

  const { isConnectedEvm, connectedSolana } = useNetworkConnect();

  const { signMessageAsync: signMessageAsyncEvm } = useSignMessage();
  const { sendTransactionAsync: sendTransactionAsyncEvm } =
    useSendTransaction();
  const { connect, isConnected } = useSocket();

  const { signMessage: signMessageAsyncSolana, publicKey: publicKeySolana } =
    useWallet();

  const ref = useRef<HTMLDivElement>(null);
  const { ref: loadingRef, inView } = useInView({
    root: ref.current,
    threshold: 0.1,
    rootMargin: "100px",
  });
  const { messagesStartRef, messagesEndRef, handleScroll, hideScroll } =
    useScroll({ status });

  const { sendMessage } = useChatStore();

  useEffect(() => {
    if (!threadId || (!isConnectedEvm && !connectedSolana)) {
      return;
    }

    connect({
      threadId,
      evm: {
        address: address as string,
        signMessageAsync: signMessageAsyncEvm,
        sendTransaction: sendTransactionAsyncEvm,
      },
      solana: {
        address: publicKeySolana?.toBase58() as string,
        signMessageAsync: signMessageAsyncSolana,
        // signTransaction: signTransactionSolana,
      },
    });

    // return () => {
    //   if (isConnected) {
    //     disconnect();
    //   }
    // };
  }, [isConnectedEvm, connectedSolana, threadId, connect]);

  useEffect(() => {
    const handleSendPendingMessage = async () => {
      const pendingMessage = localStorage.getItem("pendingMessage");

      if (isConnected && pendingMessage) {
        localStorage.removeItem("pendingMessage");
        await sendMessage(JSON.parse(pendingMessage));
        setMessage("");
        setStatus("IDLE");
      }
    };
    handleSendPendingMessage();
  }, [isConnected]);

  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      fetchMore();
    }
  }, [inView, hasMore, isLoading, isLoadingMore, fetchMore]);

  const handleSendMessage = async () => {
    const currentMessage = message;
    setMessage("");
    try {
      sendMessage({ message: currentMessage, threadId: threadId });
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("IDLE");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full max-w-[720px] mx-auto">
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
    <div className="flex-1 flex flex-col overflow-hidden w-full">
      <div className="w-full flex flex-col overflow-hidden h-full relative">
        <div
          className="overflow-auto mx-auto flex flex-col-reverse items-center w-full custom-scrollbar px-6"
          ref={ref}
          onScroll={handleScroll}
        >
          <div className="mb-auto max-w-screen md:max-w-[720px] w-full flex flex-col p-4">
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
            {messages
              ?.filter(
                (message, index, self) =>
                  index === self.findIndex((m) => m.id === message.id)
              )
              ?.sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              )
              .map((message: MessageType, index: number) => (
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
        threadId={threadId}
      />
    </div>
  );
};

export default ChatContainer;
