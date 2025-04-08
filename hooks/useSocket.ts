import { socketService } from "@/services/socket";
import { useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useAccount, useSendTransaction, useSignMessage } from "wagmi";

export const useSocket = () => {
  const searchParams = useSearchParams();
  const threadId = searchParams.get("threadId");
  const previousThreadId = useRef<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { sendTransaction } = useSendTransaction();

  const connect = useCallback(async () => {
    if (!threadId || !address || !signMessageAsync || isConnecting) return;

    try {
      setIsConnecting(true);
      // If thread has changed, ensure cleanup
      if (previousThreadId.current && previousThreadId.current !== threadId) {
        console.log(
          `Thread changed from ${previousThreadId.current} to ${threadId}`
        );
        await socketService.disconnect();
      }

      await socketService.connect(threadId, {
        address,
        signMessageAsync,
        sendTransaction,
      });
      previousThreadId.current = threadId;
    } catch (error) {
      console.error("Socket connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [threadId, address, signMessageAsync, isConnecting]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    previousThreadId.current = null;
  }, []);

  // useEffect(() => {
  //   if (typeof document === "undefined") return;

  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === "visible") {
  //       connect();
  //     }
  //   };

  //   document.addEventListener("visibilitychange", handleVisibilityChange);
  //   window.addEventListener("focus", connect);
  //   window.addEventListener("online", connect);

  //   return () => {
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //     window.removeEventListener("focus", connect);
  //     window.removeEventListener("online", connect);
  //   };
  // }, [connect]);

  return {
    isConnected: socketService.isConnected(),
    isConnecting,
    sendMessage: socketService.sendMessage.bind(socketService),
    disconnect,
    connect,
    currentThreadId: threadId,
    isReady: Boolean(address && signMessageAsync),
  };
};
