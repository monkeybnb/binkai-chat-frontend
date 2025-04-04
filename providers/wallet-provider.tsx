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
  safeWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { bsc } from "wagmi/chains";

const WALLET_CONNECT_PROJECT_ID = "xxxxxxxxxx";
const APP_NAME = "xxx";

// Custom theme configuration
const customTheme = lightTheme({
  accentColor: "var(--background)",
  accentColorForeground: "var(--foreground)",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "small",
});

export default function QueryClientProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const recommendedWalletList: WalletList = [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        binanceWallet,
        trustWallet,
        safeWallet,
        injectedWallet,
        phantomWallet,
      ],
    },
  ];

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
    },
  });

  const connectors = connectorsForWallets(recommendedWalletList, {
    projectId: WALLET_CONNECT_PROJECT_ID,
    appName: APP_NAME,
  });

  const config = createConfig({
    ssr: true,
    connectors,
    chains: [bsc],
    transports: {
      [bsc.id]: http(),
    },
  });

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
