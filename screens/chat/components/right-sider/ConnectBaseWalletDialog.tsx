import { CustomWalletButton, WALLETS } from "@/components/common/Onboarding";
import WalletButton from "@/components/common/WalletButton";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WalletButton as RainbowWalletButton } from "@rainbow-me/rainbowkit";

import { DialogContent } from "@/components/ui/dialog";

import { Dialog } from "@/components/ui/dialog";
import { useWallet } from "@solana/wallet-adapter-react";

const ListWallet = ({ type }: { type: string }) => {
  const { wallets, select, connecting } = useWallet();

  if (type === "solana") {
    return wallets.map((wallet) => (
      <WalletButton
        disabled={connecting}
        key={wallet.adapter.name}
        iconUrl={wallet.adapter.icon}
        connector={wallet.adapter}
        handleConnect={async () => {
          try {
            if (!wallet.readyState) {
              throw new Error("Please install Phantom wallet extension first");
            }

            if (wallet.adapter.connecting) {
              return;
            }

            select(wallet.adapter.name);
            wallet.adapter.connect();
          } catch (error: any) {
            console.error("Failed to connect wallet:", error?.message || error);
            if (error?.message?.includes("install")) {
              window.open("https://phantom.app/", "_blank");
            }
          }
        }}
      />
    ));
  }

  return WALLETS.map((wallet) => (
    <RainbowWalletButton.Custom wallet={wallet as any} key={wallet}>
      {(props) => <CustomWalletButton {...props} />}
    </RainbowWalletButton.Custom>
  ));
};

const ConnectBaseWalletDialog = ({
  networkConnectState,
  setNetworkConnectState,
}: {
  networkConnectState: { type: string; visible: boolean };
  setNetworkConnectState: (state: { type: string; visible: boolean }) => void;
}) => {
  return (
    <Dialog
      open={networkConnectState.visible}
      onOpenChange={() =>
        setNetworkConnectState({
          type: "",
          visible: false,
        })
      }
    >
      <DialogContent className="p-0 gap-0 max-w-[432px] z-[200]">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-center font-medium">
            Connect Base Wallet
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 flex flex-col gap-6">
          <ListWallet type={networkConnectState.type} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectBaseWalletDialog;
