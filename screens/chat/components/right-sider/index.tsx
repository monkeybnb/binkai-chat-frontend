import ConfirmDialog from "@/components/common/ConfirmDialog";
import { AlignArrowLeft } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useNetworkConnect } from "@/hooks/useNetworkConnect";
import { useViewWidth } from "@/hooks/useViewWidthHeight";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BlurMaskOverlay } from "../chat-sider/BlurMaskOverlay";
import ConnectBaseWalletDialog from "./ConnectBaseWalletDialog";
import NetworkItem from "./NetworkItem";

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
    id: 56,
    name: "BSC",
    icon: "/images/bsc.png",
  },
];

export default function RightSider({
  isOpenRightSider,
  setIsOpenRightSider,
}: RightSiderProps) {
  const [open, setOpen] = useState(false);
  const {
    isConnectedEvm,
    connectedSolana,
    networkConnectState,
    setNetworkConnectState,
    handleConnectEvm,
    handleConnectSolana,
    handleDisconnectEvm,
    handleDisconnectSolana,
    handleDisconnectAll,
  } = useNetworkConnect();

  const viewWidth = useViewWidth();
  const isHdScreen = viewWidth < 1280;

  return (
    <>
      {isHdScreen && (
        <BlurMaskOverlay
          isOpen={isOpenRightSider}
          onClose={() => setIsOpenRightSider(false)}
        />
      )}
      <div
        className={cn(
          "flex flex-col w-[300px] h-screen overflow-hidden border-l transition-all duration-300",
          {
            "w-[0px]": !isOpenRightSider,
            "absolute right-0 z-[51] bg-background": isHdScreen,
          }
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-2 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-label-large whitespace-nowrap">
              Network Conenction
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpenRightSider(!isOpenRightSider)}
              className="w-11 h-11"
            >
              <AlignArrowLeft className="rotate-180" />
            </Button>
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
            await handleDisconnectAll();
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
    </>
  );
}
