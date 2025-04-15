"use client";

declare global {
  interface Window {
    phantom?: {
      solana?: any;
    };
  }
}

import { GridBackground, LogoText } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useWalletAutoConnect } from "@/hooks/useWalletAutoConnect";
import { useAuthStore } from "@/stores/auth-store";
import { WalletButton as RainbowWalletButton } from "@rainbow-me/rainbowkit";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId, useChains, useDisconnect } from "wagmi";
import SocialLink from "./SocialLink";
import WalletButton from "./WalletButton";

export const WALLETS = ["binance", "metamask", "trust"];

interface CustomWalletButtonProps {
  ready: boolean;
  connect: () => void;
  connector: {
    iconUrl: string | (() => Promise<string>);
    name: string;
  };
}

export const CustomWalletButton = ({
  ready,
  connect,
  connector,
}: CustomWalletButtonProps) => {
  const [iconUrl, setIconUrl] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);
  const { setLoginMethod } = useAuthStore();

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

  const handleConnect = useCallback(async () => {
    if (isConnecting || !ready) return;

    try {
      setIsConnecting(true);
      await connect();
      setLoginMethod("evm");
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [connect, ready, isConnecting]);

  return (
    <WalletButton
      disabled={!ready || isConnecting}
      iconUrl={iconUrl ?? ""}
      connector={connector}
      handleConnect={handleConnect}
      isConnecting={isConnecting}
    />
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
  useWalletAutoConnect();
  const { disconnect } = useDisconnect();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { setLoginMethod } = useAuthStore();
  const { wallets, select, connecting } = useWallet();
  const solanaWallet = wallets.find(
    (wallet) => wallet.adapter.name === "Phantom"
  );
  const handleDisconnect = async () => {
    if (isDisconnecting) return;

    try {
      setIsDisconnecting(true);
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center relative bg-background">
      <div className="absolute top-0 left-0 w-screen overflow-hidden 2xl:scale-150">
        <GridBackground className="h-[160px] w-full md:h-full" />
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

          <WalletButton
            disabled={connecting}
            key={solanaWallet?.adapter.name}
            iconUrl={solanaWallet?.adapter.icon ?? ""}
            connector={solanaWallet?.adapter}
            handleConnect={async () => {
              try {
                if (!solanaWallet?.adapter) {
                  throw new Error("Phantom wallet adapter not found");
                }

                if (solanaWallet.adapter.connected) {
                  console.log("Already connected to Phantom");
                  return;
                }

                if (solanaWallet.adapter.connecting) {
                  console.log("Connection in progress...");
                  return;
                }

                setLoginMethod("solana");
                select(solanaWallet.adapter.name);

                await solanaWallet.adapter.connect();
                console.log("Successfully connected to Phantom wallet");
              } catch (error: any) {
                console.error(
                  "Failed to connect wallet:",
                  error?.message || error
                );
                if (error?.message?.toLowerCase().includes("user rejected")) {
                  console.log("User rejected the connection request");
                } else if (!window.phantom?.solana) {
                  window.open("https://phantom.app/", "_blank");
                }
              }
            }}
          />

          {isConnected && (
            <>
              <ConnectedChains />
              <Button
                variant="secondary"
                className="w-full h-[52px] mt-4"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect Wallet"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 w-full flex md:flex-col flex-row justify-between items-center md:justify-center p-4">
        <SocialLink />
        <div className="text-body-xsmall text-muted-foreground flex flex-col items-center gap-4">
          © 2025 BINK AI
        </div>
      </div>
      <div className="absolute bottom-0 left-0 rotate-180 w-screen overflow-hidden 2xl:scale-150">
        <GridBackground className="h-[160px] w-full md:h-full" />
      </div>
    </div>
  );
};

export default Onboarding;
