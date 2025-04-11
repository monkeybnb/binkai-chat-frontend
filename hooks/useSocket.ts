import { socketService } from "@/services/socket";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setIsConnecting(false);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleNetworkUnavailable = (params: { network: string }) => {
      toast(`Please connect ${params.network} network`);
    };

    socketService.on("connect", handleConnect);
    socketService.on("network_unavailable", handleNetworkUnavailable);
    return () => {
      socketService.off("connect", handleConnect);
      socketService.off("disconnect", handleDisconnect);
      socketService.off("network_unavailable", handleNetworkUnavailable);
    };
  }, []);

  const connect = useCallback(
    async ({
      threadId,
      evm,
      solana,
    }: {
      threadId: string;
      evm: {
        address: string;
        signMessageAsync: any;
        sendTransaction: any;
      };
      solana: {
        address: string;
        signMessageAsync: any;
        // signTransaction: any;
      };
    }) => {
      if (!threadId || (!evm.address && !solana.address)) {
        console.log("Missing connection params:", { threadId, evm, solana });
        return;
      }

      try {
        setIsConnecting(true);

        await socketService.connect(threadId, { evm, solana });
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
