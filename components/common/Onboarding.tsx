"use client";

import { GridBackground, LogoText } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { WalletButton as RainbowWalletButton } from "@rainbow-me/rainbowkit";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount, useChainId, useChains, useDisconnect } from "wagmi";
import SocialLink from "./SocialLink";

const WALLETS = ["metamask", "phantom", "trust", "safe"];

interface CustomWalletButtonProps {
  ready: boolean;
  connect: () => void;
  connector: {
    iconUrl: string | (() => Promise<string>);
    name: string;
  };
}

const CustomWalletButton = ({
  ready,
  connect,
  connector,
}: CustomWalletButtonProps) => {
  const [iconUrl, setIconUrl] = useState<string>();

  useEffect(() => {
    const loadIcon = async () => {
      if (typeof connector.iconUrl === "function") {
        const url = await connector.iconUrl();
        setIconUrl(url);
      } else {
        setIconUrl(connector.iconUrl);
      }
    };
    loadIcon();
  }, [connector]);

  // if (!ready) return null;

  return (
    <button
      className="w-full h-[72px] bg-muted hover:bg-brand-50 flex items-center rounded-xl justify-between pl-5 pr-4 py-4 cursor-pointer"
      onClick={connect}
    >
      <div className="flex items-center gap-4 flex-1">
        {iconUrl && (
          <img
            src={iconUrl}
            alt={connector.name}
            className="w-10 h-10 rounded-full aspect-square"
          />
        )}
        <span className="text-label-medium">{connector.name}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
};

const ConnectedChains = () => {
  const chains = useChains();
  const chainId = useChainId();

  return (
    <div className="w-full flex flex-col gap-2">
      <h3 className="text-sm text-muted-foreground">Connected Chains</h3>
      <div className="flex flex-col gap-2">
        {chains.map((chain) => (
          <div
            key={chain.id}
            className={`flex items-center justify-between p-4 rounded-lg ${
              chain.id === chainId ? "bg-brand-50" : "bg-muted"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm">{chain.name}</span>
            </div>
            {chain.id === chainId && (
              <span className="text-xs text-muted-foreground">Connected</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Onboarding = () => {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center relative bg-background">
      <div className="absolute top-0 left-0 w-screen overflow-hidden">
        <GridBackground className="w-full h-full" />
      </div>
      <div className="flex flex-col items-center gap-4 px-4 w-full max-w-[720px] relative z-10">
        <LogoText className="text-2xl" />

        <p className="text-muted-foreground-secondary text-center text-body-large">
          Getting started by connecting your crypto wallet
        </p>

        <div className="w-full flex flex-col gap-4 py-8 max-w-[440px]">
          {!isConnected &&
            WALLETS.map((wallet) => (
              <RainbowWalletButton.Custom wallet={wallet as any} key={wallet}>
                {(props) => <CustomWalletButton {...props} />}
              </RainbowWalletButton.Custom>
            ))}

          {isConnected && (
            <>
              <ConnectedChains />
              <Button
                variant="secondary"
                className="w-full h-[52px] mt-4"
                onClick={() => disconnect()}
              >
                Disconnect Wallet
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 px-4 pb-8 pt-4 text-body-xsmall text-muted-foreground flex flex-col items-center gap-4">
        <SocialLink />© 2025 BINK AI
      </div>
      <div className="absolute bottom-0 left-0 rotate-180 w-screen overflow-hidden">
        <GridBackground className="w-full h-full" />
      </div>
    </div>
  );
};

export default Onboarding;
