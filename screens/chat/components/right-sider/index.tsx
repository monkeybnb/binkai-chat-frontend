import ConfirmDialog from "@/components/common/ConfirmDialog";
import { AlignArrowLeft, Exit } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { socketService } from "@/services/socket";
import { useAuthStore } from "@/stores/auth-store";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useAccount,
  useDisconnect,
  useSendTransaction,
  useSignMessage,
} from "wagmi";
import { Chain } from "wagmi/chains";
import ConnectBaseWalletDialog from "./ConnectBaseWalletDialog";

export const BSCIcon =
  "https://s3-alpha-sig.figma.com/img/b092/31a9/0c06efc55ecafd0466d11cb0b941c09a?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=UVYdwK5FB3-Fg1bf2zxgZeOfeQGWyyAMhX4SiYtxUn-QvqNkwGUEeuKk8knLii0Pw54PNUmzYshpdQhgLqtKBTyfEGMRNOGZ3hzG1TZZ1tBaXYmuEA3P6m9o7hym18PAwJGH4bEX2trF-pmHtyerLM547uW7xbnEsLfro45SD-N9UDO2fsE4t7nKN9-lhsOoeZplWntGfPQxPGsj92qzQqWMOuPRR-1rF-xsC7FYmYhaDH9DcMUkRU4lMbqOhzAy2i9qv1NzYXVfcrE6agwfwOC07U7XXrzfZe29LFeoI8939VbAyoni0eV1NFZhK1p38jryLZgES5sqxILUpbWYZA__";

const NetworkItem = ({
  chain,
  isConnected = false,
  switchChain,
  disconnect,
}: {
  chain: any;
  isConnected?: boolean;
  switchChain?: any;
  disconnect?: any;
}) => {
  return (
    <div className="flex items-center justify-between py-2 pl-3 pr-2 border rounded-xl gap-3">
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <div className="w-7 h-7 relative rounded-full overflow-hidden">
          <Image
            src={chain.icon}
            alt={chain.name}
            fill
            className="object-contain"
          />
        </div>
        <span className="text-label-small whitespace-nowrap overflow-hidden text-ellipsis flex-1">
          {chain.name}
        </span>
      </div>
      {isConnected ? (
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9"
          onClick={() => disconnect(chain)}
        >
          <Exit />
        </Button>
      ) : (
        <Button
          variant="default"
          size="sm"
          className="rounded-lg"
          onClick={() => switchChain(chain)}
        >
          Connect
        </Button>
      )}
    </div>
  );
};

interface RightSiderProps {
  isOpenRightSider: boolean;
  setIsOpenRightSider: (value: boolean) => void;
}

export const solanaNetworks = [
  {
    id: 1,
    name: "Solana",
    icon: "/images/sol.png",
  },
];

export const evmNetworks = [
  {
    id: 1,
    name: "BSC",
    icon: "/images/bsc.png",
  },
];

export default function RightSider({
  isOpenRightSider,
  setIsOpenRightSider,
}: RightSiderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { logout } = useAuthStore();
  const { disconnectAsync } = useDisconnect();
  const { isConnected: isConnectedEvm, address } = useAccount();
  const {
    connected: connectedSolana,
    disconnect: disconnectSolana,
    publicKey,
    signMessage: signMessageSolana,
  } = useWallet();
  const { signMessageAsync } = useSignMessage();
  const { sendTransactionAsync: sendTransactionAsyncEvm } =
    useSendTransaction();

  const [networkConnectState, setNetworkConnectState] = useState<{
    type: string;
    visible: boolean;
  }>({ type: "", visible: false });

  useEffect(() => {
    if (connectedSolana) {
      socketService.updateWalletConfig({
        solana: {
          address: publicKey?.toString() || "",
          signMessageAsync: async ({ message }: { message: string }) => {
            if (!publicKey) throw new Error("Wallet not connected");

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
    });
  };

  const handleConnectSolana = async () => {
    try {
      if (!connectedSolana) {
        setNetworkConnectState({
          type: "solana",
          visible: true,
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

  return (
    <div
      className={cn(
        "flex flex-col w-[300px] h-screen overflow-hidden border-l transition-all duration-300",
        {
          "w-[0px]": !isOpenRightSider,
        }
      )}
    >
      <div className="px-4 py-2 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-label-large whitespace-nowrap">
            Network Connect
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpenRightSider(!isOpenRightSider)}
            className="w-11 h-11"
          >
            <AlignArrowLeft className="rotate-180" />
          </Button>{" "}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-6">
        {(!connectedSolana || !isConnectedEvm) && (
          <div className="flex flex-col gap-2">
            <h3 className="px-3 text-label-small text-muted-foreground">
              Supported Network
            </h3>
            {!isConnectedEvm
              ? evmNetworks.map((chain) => (
                  <NetworkItem
                    key={chain.name}
                    chain={chain}
                    switchChain={handleConnectEvm}
                  />
                ))
              : null}
            {!connectedSolana
              ? solanaNetworks.map((chain) => (
                  <NetworkItem
                    key={chain.name}
                    chain={chain}
                    switchChain={handleConnectSolana}
                  />
                ))
              : null}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="px-3 text-label-small text-muted-foreground">
            Connected
          </h3>
          {isConnectedEvm
            ? evmNetworks.map((chain) => (
                <NetworkItem
                  key={chain.name}
                  chain={chain}
                  isConnected={true}
                  disconnect={handleDisconnectEvm}
                />
              ))
            : null}
          {connectedSolana
            ? solanaNetworks.map((chain) => (
                <NetworkItem
                  key={chain.name}
                  chain={chain}
                  disconnect={handleDisconnectSolana}
                  isConnected={true}
                />
              ))
            : null}
        </div>
      </div>
      <div className="p-4">
        <Button
          size="lg"
          variant="secondary"
          className="w-full"
          onClick={() => setOpen(true)}
        >
          Disconnect All
        </Button>
      </div>
      <ConfirmDialog
        danger
        title="Disconnect All"
        description="Would you like to disconnect all networks?"
        onConfirm={async () => {
          router.push("/");
          await disconnectAsync();
          await disconnectSolana();
          logout();
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
        confirmText="Disconnect"
        open={open}
        setOpen={setOpen}
      />
      <ConnectBaseWalletDialog
        networkConnectState={networkConnectState}
        setNetworkConnectState={setNetworkConnectState}
      />
    </div>
  );
}
