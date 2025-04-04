"use client";

import { LogoText } from "@/components/icons";
import { WalletButton as RainbowWalletButton } from "@rainbow-me/rainbowkit";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import SocialLink from "./SocialLink";

const GridPattern = () => (
  <div
    className="absolute opacity-30 bg-[linear-gradient(hsla(273,77%,47%,0)_1px,transparent_1px),linear-gradient(90deg,hsla(273,77%,47%,0)_1px,transparent_1px)] [background-size:20px_20px]"
    style={{
      height: "478px",
      left: "-559.3px",
      top: "-154px",
      aspectRatio: "3837.60/478.00",
    }}
  />
);

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

  if (!ready) return null;

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

const Onboarding = () => {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center relative bg-background">
      <GridPattern />

      <div className="flex flex-col items-center gap-4 px-4 w-full max-w-[720px] relative z-10">
        <LogoText className="text-2xl" />

        <p className="text-muted-foreground-secondary text-center text-body-large">
          Getting started by connecting your crypto wallet
        </p>

        <div className="w-full flex flex-col gap-4 py-8 max-w-[440px]">
          {WALLETS.map((wallet) => (
            <RainbowWalletButton.Custom wallet={wallet as any} key={wallet}>
              {(props) => <CustomWalletButton {...props} />}
            </RainbowWalletButton.Custom>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 px-4 pb-8 pt-4 text-body-xsmall text-muted-foreground flex flex-col items-center gap-4">
        <SocialLink />© 2025 BINK AI
      </div>
    </div>
  );
};

export default Onboarding;
