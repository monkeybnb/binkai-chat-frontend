"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { disconnect: disconnectSolana } = useWallet();
  const { disconnect: disconnectEvm } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();

  const {
    connected: isConnectedSolana,
    publicKey,
    signMessage: signMessageSolana,
  } = useWallet();

  useEffect(() => {
    if (pathname === "/logout") {
      return;
    }

    if (address && isConnected && !isAuthenticated) {
      login({
        address,
        signMessageAsync,
        disconnect: disconnectEvm,
      });
      return;
    }

    // if (
    //   publicKey &&
    //   isConnectedSolana &&
    //   !isAuthenticated &&
    //   loginMethod === "solana"
    // ) {
    //   console.log(loginMethod, "loginMethod");

    //   login({
    //     address: publicKey.toString(),
    //     signMessageAsync: signMessageSolana,
    //     loginMethod,
    //     disconnect: disconnectSolana,
    //   });
    // }
  }, [address, isConnected, isAuthenticated, signMessageAsync]);

  return <>{children}</>;
}
