import { socketService } from "@/services/socket";
import { useCallback, useEffect, useState } from "react";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected");
      setIsConnected(true);
      setIsConnecting(false);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
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

  const connect = useCallback(
    async ({
      threadId,
      address,
      signMessageAsync,
      sendTransaction,
    }: {
      threadId: string;
      address: string;
      signMessageAsync: any;
      sendTransaction: any;
    }) => {
      if (!threadId || !address) {
        console.log("Missing connection params:", { threadId, address });
        return;
      }

      try {
        console.log("Connecting socket with:", { threadId, address });
        setIsConnecting(true);

        await socketService.connect(threadId, {
          address,
          signMessageAsync,
          sendTransaction,
        });

        console.log("Socket connection successful");
      } catch (error) {
        console.error("Socket connection failed:", error);
        setIsConnecting(false);
        setIsConnected(false);
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    console.log("Disconnecting socket");
    socketService.disconnect();
  }, []);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
  };
};
