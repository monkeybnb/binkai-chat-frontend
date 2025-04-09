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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { bsc } from "wagmi/chains";

const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "xxx";
const APP_NAME = "BINK AI";

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
        safepalWallet,
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
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://bink.ai",
  });

  const config = createConfig({
    ssr: true,
    connectors,
    chains: [bsc],
    transports: {
      [bsc.id]: http(),
      // [base.id]: http(),
      // [polygon.id]: http(),
      // [tron.id]: http(),
      // [mainnet.id]: http(),
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
