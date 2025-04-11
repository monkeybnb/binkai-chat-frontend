"use client";

import { useAuthStore } from "@/stores/auth-store";
import { ReactNode, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (address && isConnected && !isAuthenticated) {
      login({ address, signMessageAsync });
    }
  }, [address, isConnected, isAuthenticated]);

  return <>{children}</>;
}
