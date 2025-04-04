"use client";

import { useAuthStore } from "@/stores/auth-store";
import { ReactNode, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (address) {
      login({ address, signMessageAsync });
    }
  }, [address, login, logout, signMessageAsync]);

  return <>{children}</>;
}
