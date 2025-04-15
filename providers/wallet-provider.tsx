"use client";

import {
  connectorsForWallets,
  lightTheme,
  RainbowKitProvider,
  WalletList,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import {
  binanceWallet,
  injectedWallet,
  metaMaskWallet,
  phantomWallet,
  safepalWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { Connection } from "@solana/web3.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { bsc } from "wagmi/chains";

const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "xxx";
const APP_NAME = "BINK AI";

const customTheme = lightTheme({
  accentColor: "var(--background)",
  accentColorForeground: "var(--foreground)",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "small",
});

const recommendedWalletList: WalletList = [
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet,
      binanceWallet,
      trustWallet,
      safepalWallet,
      injectedWallet,
      phantomWallet,
    ],
  },
];

const connectors = connectorsForWallets(recommendedWalletList, {
  projectId: WALLET_CONNECT_PROJECT_ID,
  appName: APP_NAME,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://bink.ai",
});

const config = createConfig({
  ssr: true,
  chains: [bsc],
  connectors,
  transports: {
    [bsc.id]: http(),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});
const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "";

export const connection = new Connection(rpc, "confirmed");

export default function QueryClientProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={rpc}>
          <SolanaWalletProvider wallets={wallets}>
            <WalletModalProvider>
              <RainbowKitProvider modalSize="compact" theme={customTheme}>
                {children}
              </RainbowKitProvider>
            </WalletModalProvider>
          </SolanaWalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
