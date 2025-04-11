"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { evmNetworks, solanaNetworks } from "../right-sider";

const NetworkList = () => {
  const { connected: solanaConnected } = useWallet();
  const { isConnected: evmConnected } = useAccount();
  const evm = evmConnected ? evmNetworks : [];
  const solana = solanaConnected ? solanaNetworks : [];
  const networks = [...evm, ...solana];
  const displayedNetworks = networks.slice(0, 3);
  const remainingCount = networks.length - displayedNetworks.length;

  return (
    <div className="flex -space-x-3 items-center px-1.5 py-1">
      {displayedNetworks.map((network, index) => (
        <div
          key={network?.name}
          className="w-9 h-9 rounded-full overflow-hidden bg-background border-2 border-background relative"
          style={{ zIndex: networks.length - index }}
        >
          <Image
            src={network?.icon}
            alt={network?.name || ""}
            fill
            className="object-contain w-9 h-9"
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center border-2 text-xs font-medium relative"
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

const UserBtn = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="flex items-center cursor-pointer" onClick={onClick}>
      <NetworkList />
    </div>
  );
};

export default UserBtn;
