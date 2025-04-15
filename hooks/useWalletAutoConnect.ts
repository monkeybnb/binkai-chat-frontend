import { useEffect } from "react";
import { useConnect, useDisconnect } from "wagmi";

export function useWalletAutoConnect() {
  const { disconnect } = useDisconnect();
  const { connectors } = useConnect();

  useEffect(() => {
    // Disconnect any auto-connected wallets on mount
    disconnect();
  }, [disconnect, connectors]);
}
