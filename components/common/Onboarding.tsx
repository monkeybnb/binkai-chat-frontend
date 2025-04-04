"use client";

import { LogoText } from "@/components/icons";
import { ChevronRight } from "lucide-react";
import { Connector, useConnect } from "wagmi";
import SocialLink from "./SocialLink";

const GridPattern = () => (
  <div
    className="absolute inset-0 w-full h-full"
    style={{
      backgroundImage: `linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)`,
      backgroundSize: "20px 20px",
      opacity: 0.2,
    }}
  />
);

const Onboarding = () => {
  const { connectors, connect, status, error } = useConnect();
  console.log(connectors);

  const handleConnect = (connector: Connector) => {
    console.log(connector);
    connect({ connector });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-background">
      <GridPattern />

      <div className="flex flex-col items-center gap-4 px-4 w-full max-w-[720px] relative z-10">
        <LogoText className="text-2xl" />

        <p className="text-muted-foreground-secondary text-center text-body-large">
          Getting started by connecting your crypto wallet
        </p>

        <div className="w-full flex flex-col gap-4 py-8 max-w-[440px]">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              className="w-full h-[72px] bg-muted hover:bg-brand-50 flex items-center rounded-xl justify-between pl-5 pr-4 py-4 cursor-pointer"
              onClick={() => handleConnect(connector)}
            >
              <div className="flex items-center gap-4 flex-1">
                {connector.icon && (
                  <img
                    src={connector.icon}
                    alt={connector.name}
                    className="w-10 h-10 rounded-full aspect-square"
                  />
                )}
                <span className="text-label-medium">{connector.name}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive mt-4">{error.message}</p>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 px-4 pb-8 pt-4 text-body-xsmall text-muted-foreground flex flex-col items-center gap-4">
        <SocialLink />© 2025 BINK AI
      </div>
    </div>
  );
};

export default Onboarding;
