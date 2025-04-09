import { socketService } from "@/services/socket";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useSendTransaction, useSignMessage } from "wagmi";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const searchParams = useSearchParams();
  const threadId = searchParams.get("threadId") as string;
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { sendTransaction } = useSendTransaction();

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setIsConnecting(false);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    socketService.on("connect", handleConnect);
    socketService.on("disconnect", handleDisconnect);

    // Cleanup event listeners
    return () => {
      socketService.off("connect", handleConnect);
      socketService.off("disconnect", handleDisconnect);
    };
  }, []);

  const connect = useCallback(async () => {
    console.log(threadId, address, "connect-useSocket1");

    if (!threadId || !address) return;
    console.log(address, "connect-useSocket");
    try {
      setIsConnecting(true);

      await socketService.connect(threadId, {
        address,
        signMessageAsync,
        sendTransaction,
      });
    } catch (error) {
      console.error("Failed to connect socket:", error);
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [threadId, address, signMessageAsync, sendTransaction]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
  };
};
