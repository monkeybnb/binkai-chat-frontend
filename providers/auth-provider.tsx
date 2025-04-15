"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useWallet } from "@solana/wallet-adapter-react";
import { ReactNode, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { loginMethod } = useAuthStore();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    connected: isConnectedSolana,
    publicKey,
    signMessage: signMessageSolana,
  } = useWallet();

  useEffect(() => {
    if (address && isConnected && !isAuthenticated && loginMethod === "evm") {
      console.log(loginMethod, "loginMethod");

      login({ address, signMessageAsync, loginMethod });
      return;
    }

    if (
      publicKey &&
      isConnectedSolana &&
      !isAuthenticated &&
      loginMethod === "solana"
    ) {
      console.log(loginMethod, "loginMethod");

      login({
        address: publicKey.toString(),
        signMessageAsync: signMessageSolana,
        loginMethod,
      });
    }
  }, [address, isConnected, isAuthenticated, publicKey, isConnectedSolana]);

  return <>{children}</>;
}
