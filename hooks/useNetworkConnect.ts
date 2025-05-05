import { socketService } from "@/services/socket";
import { useAuthStore } from "@/stores/auth-store";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useAccount,
  useDisconnect,
  useSendTransaction,
  useSignMessage,
} from "wagmi";
import { Chain } from "wagmi/chains";

export interface NetworkConnectState {
  type: string;
  visible: boolean;
  network?: string;
}

export const useNetworkConnect = () => {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { disconnectAsync, disconnect } = useDisconnect();
  const { isConnected: isConnectedEvm, address } = useAccount();
  const {
    connected: connectedSolana,
    disconnect: disconnectSolana,
    publicKey: publicKeySolana,
    signMessage: signMessageSolana,
  } = useWallet();
  const { address: addressEvm } = useAccount();

  const { signMessageAsync } = useSignMessage();
  const { sendTransactionAsync: sendTransactionAsyncEvm } =
    useSendTransaction();

  const [networkConnectState, setNetworkConnectState] =
    useState<NetworkConnectState>({
      type: "",
      visible: false,
    });

  // useEffect(() => {
  //   const handleNetworkUnavailable = (params: { network: string }) => {
  //     if (params.network === "solana") {
  //       setNetworkConnectState({
  //         type: "solana",
  //         visible: true,
  //         network: params.network,
  //       });
  //     } else if (params.network === "evm") {
  //       setNetworkConnectState({
  //         type: "evm",
  //         visible: true,
  //         network: params.network,
  //       });
  //     }
  //   };

  //   socketService.on("network_unavailable", handleNetworkUnavailable);

  //   return () => {
  //     socketService.off("network_unavailable", handleNetworkUnavailable);
  //   };
  // }, []);

  useEffect(() => {
    if (connectedSolana) {
      socketService.updateWalletConfig({
        solana: {
          address: publicKeySolana?.toString() || "",
          signMessageAsync: async ({ message }: { message: string }) => {
            if (!publicKeySolana) throw new Error("Wallet not connected");

            const encodedMessage = new TextEncoder().encode(message);
            const signedMessage = await signMessageSolana?.(encodedMessage);
            if (!signedMessage) throw new Error("Failed to sign message");
            return Buffer.from(signedMessage).toString("base64");
          },
        },
      });
      setNetworkConnectState({
        type: "",
        visible: false,
      });
    }
  }, [connectedSolana]);

  useEffect(() => {
    if (isConnectedEvm) {
      socketService.updateWalletConfig({
        evm: {
          address: address ?? "",
          signMessageAsync,
          sendTransaction: sendTransactionAsyncEvm,
        },
      });
      setNetworkConnectState({
        type: "",
        visible: false,
      });
    }
  }, [isConnectedEvm]);

  const handleConnectEvm = (chain: Chain) => {
    setNetworkConnectState({
      type: "evm",
      visible: true,
      network: chain.name.toLowerCase(),
    });
  };

  const handleConnectSolana = async () => {
    try {
      if (!connectedSolana) {
        setNetworkConnectState({
          type: "solana",
          visible: true,
          network: "solana",
        });
      }
    } catch (error) {
      console.error("Failed to connect Solana wallet:", error);
    }
  };

  const handleDisconnectSolana = async () => {
    await disconnectSolana();

    if (!isConnectedEvm) {
      router.push("/");
      logout();
    }
  };

  const handleDisconnectEvm = async () => {
    await disconnectAsync();

    if (!connectedSolana) {
      router.push("/");
      logout();
    }
  };

  const handleDisconnectAll = async () => {
    await disconnectAsync();
    await disconnect();
    await disconnectSolana();
    logout();

    console.log("disconnectAll");

    router.push("/");
  };

  return {
    isConnectedEvm,
    connectedSolana,
    networkConnectState,
    setNetworkConnectState,
    handleConnectEvm,
    handleConnectSolana,
    handleDisconnectEvm,
    handleDisconnectSolana,
    handleDisconnectAll,
    addressSolana: publicKeySolana?.toString(),
    addressEvm,
  };
};
